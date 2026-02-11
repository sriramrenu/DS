const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showDatabaseContents() {
    try {
        console.log('📊 DATABASE CONTENTS\n');
        console.log('='.repeat(80));

        // Users
        const users = await prisma.user.findMany({
            include: { team: true }
        });
        console.log('\n👥 USERS (' + users.length + ' total)');
        console.log('-'.repeat(80));
        users.forEach(user => {
            console.log(`  ID: ${user.id} | Username: ${user.username} | Role: ${user.role} | Team: ${user.team?.teamName || 'None'}`);
        });

        // Teams
        const teams = await prisma.team.findMany();
        console.log('\n\n🏆 TEAMS (' + teams.length + ' total)');
        console.log('-'.repeat(80));
        teams.forEach(team => {
            console.log(`  ID: ${team.id} | Name: ${team.team_name} | Group: ${team.group}`);
        });

        // Scores
        const scores = await prisma.score.findMany({
            include: { team: true }
        });
        console.log('\n\n📈 SCORES (' + scores.length + ' total)');
        console.log('-'.repeat(80));
        scores.forEach(score => {
            console.log(`  Team: ${score.team.teamName} | Phase1: ${score.phase1_score} | Phase2: ${score.phase2_score} | Phase3: ${score.phase3_score} | Phase4: ${score.phase4_score} | Total: ${score.total_score}`);
        });

        // Submissions
        const submissions = await prisma.submission.findMany({
            include: { team: true }
        });
        console.log('\n\n📤 SUBMISSIONS (' + submissions.length + ' total)');
        console.log('-'.repeat(80));
        if (submissions.length === 0) {
            console.log('  No submissions yet');
        } else {
            submissions.forEach(sub => {
                console.log(`  ID: ${sub.id} | Team: ${sub.team?.team_name} | Answer: ${sub.numericAnswer} | Time: ${sub.submittedAt}`);
                console.log(`  Image: ${sub.imageUrl}`);
            });
        }

        // Settings
        const settings = await prisma.systemSetting.findMany();
        console.log('\n\n⚙️ SYSTEM SETTINGS (' + settings.length + ' total)');
        console.log('-'.repeat(80));
        settings.forEach(s => {
            console.log(`  ${s.key}: ${s.value}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ Database query complete!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

showDatabaseContents();
