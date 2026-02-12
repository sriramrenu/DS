import { PrismaClient, Group, Role } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Cleanup (COMMENTED OUT TO PREVENT DATA LOSS DURING UPDATES)
    // await prisma.submission.deleteMany();
    // await prisma.score.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.team.deleteMany();

    // 2. Create Admin
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: 'password123', // In production, hash this!
            role: Role.Admin,
        },
    });
    console.log('Created Admin user.');

    // 3. Create Teams & Users
    const teamsList = [
        // L1 (1-6)
        { code: 'U300UX2H', name: 'Z.E.R.O', group: Group.L1 },
        { code: 'UH6E2D84', name: 'Tech Titans', group: Group.L1 },
        { code: 'U49HKJ09', name: 'CodAura', group: Group.L1 },
        { code: 'UR44M69S', name: 'Data squad', group: Group.L1 },
        { code: 'U254RJA3', name: 'Byte Coders', group: Group.L1 },
        { code: 'U7QL0Z95', name: 'Rock stars', group: Group.L1 },
        // L2 (7-12)
        { code: 'UMPI1270', name: 'Nexon', group: Group.L2 },
        { code: 'UX700CH5', name: 'Data Pirates', group: Group.L2 },
        { code: 'U6ZV7W44', name: 'Hakkuna Matata', group: Group.L2 },
        { code: 'UG7765KP', name: 'Lumora', group: Group.L2 },
        { code: 'U4K83FQ7', name: 'CodeX', group: Group.L2 },
        { code: 'mec1234', name: 'Codex', group: Group.L2 },
        { code: 'U2Q7D9M7', name: 'Quantum Coders', group: Group.L2 },
        // S1 (13-18)
        { code: 'U49MU29A', name: 'Innovatrix', group: Group.S1 },
        { code: 'UD5L5Y98', name: 'Silver Fox', group: Group.S1 },
        { code: 'U2U08QV6', name: 'Flying Ninjas', group: Group.S1 },
        { code: 'U464OYT0', name: 'PeaceCoders', group: Group.S1 },
        { code: 'UH38C60Y', name: 'Royal Challengers', group: Group.S1 },
        { code: 'UQ17CD92', name: 'Femflare', group: Group.S1 },
        // S2 (19-25)
        { code: 'U679U1KY', name: 'Quad Coders', group: Group.S2 },
        { code: 'U8H32T5J', name: 'NeuraNext', group: Group.S2 },
        { code: 'U2678JCQ', name: 'ZENITHAL', group: Group.S2 },
        { code: 'U8JD457C', name: 'SpotX', group: Group.S2 },
        { code: 'U1JM767R', name: 'hackZ', group: Group.S2 },
        { code: 'UC9G2Y98', name: 'Innov', group: Group.S2 },
        { code: 'UR678BZ6', name: 'Cosmic Crusaders', group: Group.S2 }
    ];

    const teamsData = [];

    for (const t of teamsList) {
        // Create Team
        const team = await prisma.team.upsert({
            where: { team_name: t.name },
            update: { group: t.group },
            create: {
                team_name: t.name,
                group: t.group,
            },
        });

        // Create User (Participant)
        // Username = Team Name, Password = Team Code
        await prisma.user.upsert({
            where: { username: t.name },
            update: { password: t.code, teamId: team.id, role: Role.Participant },
            create: {
                username: t.name,
                password: t.code,
                role: Role.Participant,
                teamId: team.id,
            },
        });

        // Initialize Score
        await prisma.score.upsert({
            where: { teamId: team.id },
            update: {},
            create: {
                teamId: team.id,
            },
        });

        teamsData.push({ team: t.name, user: t.name, group: t.group });
        console.log(`Seeded team: ${t.name} (${t.group})`);
    }

    console.log(`Seeded ${teamsData.length} teams.`);

    // 4. Create Initial System Settings
    await prisma.systemSetting.upsert({
        where: { key: 'current_round' },
        update: {},
        create: {
            key: 'current_round',
            value: '1',
        },
    });

    // 5. Create Round Content (Specialized for Logistics Tracks L1/L2)
    const rounds = [
        {
            id: 1,
            track: 'L1',
            title: 'Round 1: Show Me Where the System Is Breaking',
            description: `You’ve just entered the company. Leadership doesn’t even agree on where the real problems are. Operations teams blame traffic. Warehouses blame staffing. Tech teams say the system is fine. Before we fix anything, we need clarity. Right now, the business needs visibility. 

What the CEO gives you (data): delivery operation data and warehouse/route context data. 

What you are expected to produce (outcomes): Use the data to visually answer: Where delays are happening, When they tend to occur, What operational conditions are linked to delays, Where the system is under capacity stress, Which patterns look normal but hide risk, and whether internal KPIs truly reflect real performance.

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ]`,
            datasetPrefix: 'round1',
            questions: [
                { id: 'delay', type: 'select', label: '1.) Delay/On-time', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'eta', type: 'number', label: '2.) Expected delivery time', placeholder: 'e.g. 14.5' },
                { id: 'vis_proof', type: 'image', label: '3.) drop your visualisations asked in the description and proof for the stages of cleaning done', placeholder: 'Upload Image' },
                { id: 'features', type: 'textarea', label: '4.) Feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'feature_proof', type: 'textarea', label: '5.) Feature engineering proof and meaningful constraint', placeholder: 'State and prove constraints...' },
                { id: 'model_explanation', type: 'textarea', label: '6.) Explain the blocks of your ML model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 1,
            track: 'L2',
            title: 'Round 1: Show Me Where the System Is Breaking',
            description: `You’ve just entered the company. Leadership doesn’t even agree on where the real problems are. Operations teams blame traffic. Warehouses blame staffing. Tech teams say the system is fine. Before we fix anything, we need clarity. Right now, the business needs visibility. 

What the CEO gives you (data): delivery operation data and warehouse/route context data. 

What you are expected to produce (outcomes): Use the data to visually answer: Where delays are happening, When they tend to occur, What operational conditions are linked to delays, Where the system is under capacity stress, Which patterns look normal but hide risk, and whether internal KPIs truly reflect real performance.

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ]`,
            datasetPrefix: 'round1',
            questions: [
                { id: 'delay', type: 'select', label: '1.) Delay/On-time', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'eta', type: 'number', label: '2.) Expected delivery time', placeholder: 'e.g. 14.5' },
                { id: 'vis_proof', type: 'image', label: '3.) drop your visualisations asked in the description and proof for the stages of cleaning done', placeholder: 'Upload Image' },
                { id: 'features', type: 'textarea', label: '4.) Feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'feature_proof', type: 'textarea', label: '5.) Feature engineering proof and meaningful constraint', placeholder: 'State and prove constraints...' },
                { id: 'model_explanation', type: 'textarea', label: '6.) Explain the blocks of your ML model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 2,
            track: 'L1',
            title: 'Round 2: Foresight and Anticipation',
            description: `Now that problem areas are visible, leadership wants foresight. The question is no longer “Where are we failing?” but “Can we see failure coming before it happens?” The company wants to move from reacting to delays to anticipating them. 

What the CEO gives you (data): 
You will receive route execution data combined with customer and SLA context. 
This shows how deliveries are planned and executed, and how failures affect customers and business commitments. 

What you are expected to produce (outcomes): 
Your analysis should visually help answer: 
- Where SLA risk is concentrated 
- When breach risk spikes 
- What operational and environmental conditions increase failure probability 
- How failures translate into customer impact 
- How deliveries can be segmented by risk 

At the end of the round, a sample delivery + customer context profile will be given. 

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ] 

Predict whether the delivery is likely to breach SLA 
Estimate the expected delay 

This round is about building foresight into the system.`,
            datasetPrefix: 'round2',
            questions: [
                { id: 'breach_sla', type: 'select', label: '1.) Predict whether the delivery is likely to breach SLA', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'expected_delay', type: 'number', label: '2.) Estimate the expected delay', placeholder: 'e.g. 15.8' },
                { id: 'vis_proof_r2', type: 'image', label: '3.) drop your visualisations asked in the description and proof for the stages of cleaning done', placeholder: 'Upload Image' },
                { id: 'features_r2', type: 'textarea', label: '4.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'model_explanation_r2', type: 'textarea', label: '5.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 2,
            track: 'L2',
            title: 'Round 2: Foresight and Anticipation',
            description: `Now that problem areas are visible, leadership wants foresight. The question is no longer “Where are we failing?” but “Can we see failure coming before it happens?” The company wants to move from reacting to delays to anticipating them. 

What the CEO gives you (data): 
You will receive route execution data combined with customer and SLA context. 
This shows how deliveries are planned and executed, and how failures affect customers and business commitments. 

What you are expected to produce (outcomes): 
Your analysis should visually help answer: 
- Where SLA risk is concentrated 
- When breach risk spikes 
- What operational and environmental conditions increase failure probability 
- How failures translate into customer impact 
- How deliveries can be segmented by risk 

At the end of the round, a sample delivery + customer context profile will be given. 

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ] 

Predict whether the delivery is likely to breach SLA 
Estimate the expected delay 

This round is about building foresight into the system.`,
            datasetPrefix: 'round2',
            questions: [
                { id: 'breach_sla', type: 'select', label: '1.) Predict whether the delivery is likely to breach SLA', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'expected_delay', type: 'number', label: '2.) Estimate the expected delay', placeholder: 'e.g. 15.8' },
                { id: 'vis_proof_r2', type: 'image', label: '3.) drop your visualisations asked in the description and proof for the stages of cleaning done', placeholder: 'Upload Image' },
                { id: 'features_r2', type: 'textarea', label: '4.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'model_explanation_r2', type: 'textarea', label: '5.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 3,
            track: 'L1',
            title: 'Round 3: The Slow Collapse No One Notices',
            description: `Even with predictive models, leadership senses that some regions are quietly deteriorating over time. Nothing dramatic breaks in a single day, but month after month, certain zones become less reliable. The concern is not sudden failure, but slow system decay. 

What the CEO gives you (data): 
You will receive zone-level monthly performance data along with system and business context. 
This shows how different regions evolve over time and how stable the operational system is. 

What you are expected to produce (outcomes): 
Your analysis should visually help answer: 
- Which zones show signs of gradual performance degradation? 
- Where is operational stability weakening over time? 
- Are there early warning patterns of long-term failure? 
- How does system health relate to zone-level performance? 

At the end of the round, a sample zone profile will be given. 

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ] 

Predict whether the zone is entering a degradation phase 
Estimate the severity of degradation 

This round is about detecting slow failure before it becomes visible collapse.`,
            datasetPrefix: 'round3',
            questions: [
                { id: 'predict_degradation', type: 'select', label: '1.) Predict whether the zone is entering a degradation phase', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'severity', type: 'textarea', label: '2.) Estimate the severity of degradation', placeholder: 'Describe severity...' },
                { id: 'vis_proof_r3', type: 'image', label: '3.) drop your visualisations asked in the description and proof for the stages of cleaning', placeholder: 'Upload Image' },
                { id: 'features_r3', type: 'textarea', label: '4.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'constrain_proof', type: 'textarea', label: '5.) State and prove that the feature engineering used is true and has meaningful constrain', placeholder: 'Explain constraints...' },
                { id: 'model_explanation_r3', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 3,
            track: 'L2',
            title: 'Round 3: The Slow Collapse No One Notices',
            description: `Even with predictive models, leadership senses that some regions are quietly deteriorating over time. Nothing dramatic breaks in a single day, but month after month, certain zones become less reliable. The concern is not sudden failure, but slow system decay. 

What the CEO gives you (data): 
You will receive zone-level monthly performance data along with system and business context. 
This shows how different regions evolve over time and how stable the operational system is. 

What you are expected to produce (outcomes): 
Your analysis should visually help answer: 
- Which zones show signs of gradual performance degradation? 
- Where is operational stability weakening over time? 
- Are there early warning patterns of long-term failure? 
- How does system health relate to zone-level performance? 

At the end of the round, a sample zone profile will be given. 

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ] 

Predict whether the zone is entering a degradation phase 
Estimate the severity of degradation 

This round is about detecting slow failure before it becomes visible collapse.`,
            datasetPrefix: 'round3',
            questions: [
                { id: 'predict_degradation', type: 'select', label: '1.) Predict whether the zone is entering a degradation phase', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'severity', type: 'textarea', label: '2.) Estimate the severity of degradation', placeholder: 'Describe severity...' },
                { id: 'vis_proof_r3', type: 'image', label: '3.) drop your visualisations asked in the description and proof for the stages of cleaning', placeholder: 'Upload Image' },
                { id: 'features_r3', type: 'textarea', label: '4.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'constrain_proof', type: 'textarea', label: '5.) State and prove that the feature engineering used is true and has meaningful constrain', placeholder: 'Explain constraints...' },
                { id: 'model_explanation_r3', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 4,
            track: 'L1',
            title: 'Round 4: When Automation Becomes Dangerous',
            description: `The company now relies heavily on automated decision systems. Leadership is worried that confidence scores, policy thresholds, and automation levels may be masking real risks. Recent incidents suggest that governance gaps can turn small errors into major crises. 

What the CEO gives you (data): 
You will receive automation decision logs and incident impact records. 
This data reflects how automated systems behave and what happens when things go wrong. 

What you are expected to produce (outcomes): 
Your analysis should visually help answer: 
- Under what conditions do automated decisions become risky? 
- What patterns are associated with high-impact incidents? 
- Where are governance and control weaknesses visible? 
- How does operational pressure amplify incident severity? 

At the end of the round, a locked automation scenario will be given. 

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ] 

Predict whether the case represents a high-risk incident 
Estimate the overall risk severity 

This round is about deciding when automation should be allowed and when it must be stopped.`,
            datasetPrefix: 'round4',
            questions: [
                { id: 'predict_incident', type: 'select', label: '1.) Predict whether the case represents a high-risk incident', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'risk_severity', type: 'textarea', label: '2.) Estimate the overall risk severity', placeholder: 'Describe risk severity...' },
                { id: 'vis_proof_r4', type: 'image', label: '3.) drop your visualisations asked in the description and proof for stages of cleaning', placeholder: 'Upload Image' },
                { id: 'features_r4', type: 'textarea', label: '4.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'constrain_proof_r4', type: 'textarea', label: '5.) State and prove that the feature engineering used is true and has meaningful constrain', placeholder: 'Explain constraints...' },
                { id: 'model_explanation_r4', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 4,
            track: 'L2',
            title: 'Round 4: When Automation Becomes Dangerous',
            description: `The company now relies heavily on automated decision systems. Leadership is worried that confidence scores, policy thresholds, and automation levels may be masking real risks. Recent incidents suggest that governance gaps can turn small errors into major crises. 

What the CEO gives you (data): 
You will receive automation decision logs and incident impact records. 
This data reflects how automated systems behave and what happens when things go wrong. 

What you are expected to produce (outcomes): 
Your analysis should visually help answer: 
- Under what conditions do automated decisions become risky? 
- What patterns are associated with high-impact incidents? 
- Where are governance and control weaknesses visible? 
- How does operational pressure amplify incident severity? 

At the end of the round, a locked automation scenario will be given. 

[ NOTE: The sample inputs will be given at the end of the rounds when submission portal opens. Participants have to predict for the insights that asked for all the rounds ] 

Predict whether the case represents a high-risk incident 
Estimate the overall risk severity 

This round is about deciding when automation should be allowed and when it must be stopped.`,
            datasetPrefix: 'round4',
            questions: [
                { id: 'predict_incident', type: 'select', label: '1.) Predict whether the case represents a high-risk incident', placeholder: 'Select...', options: ['Yes', 'No'] },
                { id: 'risk_severity', type: 'textarea', label: '2.) Estimate the overall risk severity', placeholder: 'Describe risk severity...' },
                { id: 'vis_proof_r4', type: 'image', label: '3.) drop your visualisations asked in the description and proof for stages of cleaning', placeholder: 'Upload Image' },
                { id: 'features_r4', type: 'textarea', label: '4.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics and formulas...' },
                { id: 'constrain_proof_r4', type: 'textarea', label: '5.) State and prove that the feature engineering used is true and has meaningful constrain', placeholder: 'Explain constraints...' },
                { id: 'model_explanation_r4', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model architecture...' }
            ],
        },
        {
            id: 1,
            track: 'S1',
            title: 'Round 1: FINDING THE STUDENTS WHO ARE QUIETLY STRUGGLING',
            description: `Round description: FINDING THE STUDENTS WHO ARE QUIETLY STRUGGLING
Faculty members believe students are doing fine. Administrators see acceptable averages. 
Dashboards show decent attendance and CGPAs. 
But the leadership suspects something else — some students may be structurally fragile even if their numbers appear normal. 
Before any intervention can happen, the institution needs clarity.

What the Institution Gives You (Data) 
Data Provided: 
• Academic micro-performance data 
• Environment and support system data 
• Indicators of attendance, stress, sleep, engagement, mentoring, and routines 
This represents how students are functioning right now, beyond just grades. 

What You Are Expected to Produce (Outcomes) 
Your analysis should visually and logically help answer: 
• Which student groups show hidden academic fragility 
• Which behavior patterns signal future collapse 
• What attendance or performance volatility threshold increases risk sharply 
• Which metrics appear predictive but are misleading 
• What the earliest warning signals truly are

NOTE: Sample inputs will be provided only when the submission portal opens. 
Participants must use their insights from all rounds to predict outcomes.`,
            datasetPrefix: 'round1',
            questions: [
                { id: 'fragility_class', type: 'select', label: '1.) Student\'s Fragility Class', placeholder: 'Select...', options: ['Stable', 'Fragile', 'High-Risk'] },
                { id: 'drop_prob', type: 'number', label: '2.) Probability of Sudden Academic Drop (%)', placeholder: 'e.g. 75.5' },
                { id: 'score_decline', type: 'number', label: '3.) Expected Internal Score Decline (%)', placeholder: 'e.g. 10.5' },
                { id: 'vis_proof_s1_r1', type: 'image', label: '4.) Drop your visualisations asked in description and proof for stages of cleaning', placeholder: 'Upload Image' },
                { id: 'feature_eng_s1', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s1', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 1,
            track: 'S2',
            title: 'Round 1: FINDING THE STUDENTS WHO ARE QUIETLY STRUGGLING',
            description: `Round description: FINDING THE STUDENTS WHO ARE QUIETLY STRUGGLING
Faculty members believe students are doing fine. Administrators see acceptable averages. 
Dashboards show decent attendance and CGPAs. 
But the leadership suspects something else — some students may be structurally fragile even if their numbers appear normal. 
Before any intervention can happen, the institution needs clarity.

What the Institution Gives You (Data) 
Data Provided: 
• Academic micro-performance data 
• Environment and support system data 
• Indicators of attendance, stress, sleep, engagement, mentoring, and routines 
This represents how students are functioning right now, beyond just grades. 

What You Are Expected to Produce (Outcomes) 
Your analysis should visually and logically help answer: 
• Which student groups show hidden academic fragility 
• Which behavior patterns signal future collapse 
• What attendance or performance volatility threshold increases risk sharply 
• Which metrics appear predictive but are misleading 
• What the earliest warning signals truly are

NOTE: Sample inputs will be provided only when the submission portal opens. 
Participants must use their insights from all rounds to predict outcomes.`,
            datasetPrefix: 'round1',
            questions: [
                { id: 'fragility_class', type: 'select', label: '1.) Student\'s Fragility Class', placeholder: 'Select...', options: ['Stable', 'Fragile', 'High-Risk'] },
                { id: 'drop_prob', type: 'number', label: '2.) Probability of Sudden Academic Drop (%)', placeholder: 'e.g. 75.5' },
                { id: 'score_decline', type: 'number', label: '3.) Expected Internal Score Decline (%)', placeholder: 'e.g. 10.5' },
                { id: 'vis_proof_s2_r1', type: 'image', label: '4.) Drop your visualisations asked in description and proof for stages of cleaning', placeholder: 'Upload Image' },
                { id: 'feature_eng_s2', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s2', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 2,
            track: 'S1',
            title: 'Round 2: WHEN STRONG RESUMES HIDE WEAK SKILLS',
            description: `Round description:

Now the institution shifts focus. 
Students appear active — certifications are rising, participation is high, resumes look impressive. 
Yet placement screenings filter out many candidates. 
The concern is not effort — it is skill imbalance. 
The Hidden Issues: 
• Some students are over-certified but under-skilled 
• Some are technically strong but poor communicators 
• Some build resumes but lack practical problem-solving depth 

What the Institution Gives You (Data) 
Data Provided: 
• Skill activity and certification data 
• Real-world skill assessment metrics 
• Internship, project, coding, communication, and collaboration indicators 
This data represents how students appear employable versus how they actually perform.

NOTE: Sample inputs will be provided only when the submission portal opens.`,
            datasetPrefix: 'round2',
            questions: [
                { id: 'readiness_class', type: 'select', label: '1.) Readiness Class', placeholder: 'Select...', options: ['Balanced-Ready', 'Over-Certified', 'Under-Skilled'] },
                { id: 'screening_prob', type: 'number', label: '2.) Probability of Clearing Real Screening (%)', placeholder: 'e.g. 85.5' },
                { id: 'screening_score', type: 'number', label: '3.) Predicted Screening Performance Score (0-100)', placeholder: 'e.g. 78' },
                { id: 'vis_proof_s1_r2', type: 'image', label: '4.) Drop your visualisations asked in description and proof for stages of cleaning', placeholder: 'Upload Image' },
                { id: 'feature_eng_s1_r2', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s1_r2', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 2,
            track: 'S2',
            title: 'Round 2: WHEN STRONG RESUMES HIDE WEAK SKILLS',
            description: `Round description:

Now the institution shifts focus. 
Students appear active — certifications are rising, participation is high, resumes look impressive. 
Yet placement screenings filter out many candidates. 
The concern is not effort — it is skill imbalance. 
The Hidden Issues: 
• Some students are over-certified but under-skilled 
• Some are technically strong but poor communicators 
• Some build resumes but lack practical problem-solving depth 

What the Institution Gives You (Data) 
Data Provided: 
• Skill activity and certification data 
• Real-world skill assessment metrics 
• Internship, project, coding, communication, and collaboration indicators 
This data represents how students appear employable versus how they actually perform.

NOTE: Sample inputs will be provided only when the submission portal opens.`,
            datasetPrefix: 'round2',
            questions: [
                { id: 'readiness_class', type: 'select', label: '1.) Readiness Class', placeholder: 'Select...', options: ['Balanced-Ready', 'Over-Certified', 'Under-Skilled'] },
                { id: 'screening_prob', type: 'number', label: '2.) Probability of Clearing Real Screening (%)', placeholder: 'e.g. 85.5' },
                { id: 'screening_score', type: 'number', label: '3.) Predicted Screening Performance Score (0-100)', placeholder: 'e.g. 78' },
                { id: 'vis_proof_s2_r2', type: 'image', label: '4.) Drop your visualisations asked in description and proof for stages of cleaning', placeholder: 'Upload Image' },
                { id: 'feature_eng_s2_r2', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s2_r2', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 3,
            track: 'S1',
            title: 'Round 3: THE SLOW DRIFT NO ONE NOTICES',
            description: `Round description:

Even with performance metrics and skill tracking, leadership senses that some students are 
quietly deteriorating over time. 
Nothing dramatic happens in a single semester. But month after month, engagement drops, stress 
rises, and consistency weakens. 
The danger is not sudden failure. The danger is slow academic drift. 

What the Institution Gives You (Data) 
Data Provided: 
• Longitudinal monthly student trajectory data 
• Institutional monitoring and engagement signals 
• Indicators of consistency, volatility, stress, and academic load 
This shows how student journeys evolve over time, not just in snapshots.

NOTE: Sample inputs will be provided only when the submission portal opens.`,
            datasetPrefix: 'round3',
            questions: [
                { id: 'next_regime', type: 'select', label: '1.) Next Regime', placeholder: 'Select...', options: ['Growth', 'Stagnation', 'Decline'] },
                { id: 'decline_prob', type: 'number', label: '2.) Probability of Entering Decline (%)', placeholder: 'e.g. 65.2' },
                { id: 'engagement_change', type: 'number', label: '3.) Predicted Engagement Index Change', placeholder: 'e.g. -12.5' },
                { id: 'vis_proof_s1_r3', type: 'image', label: '4.) Drop your visualization', placeholder: 'Upload Image' },
                { id: 'feature_eng_s1_r3', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s1_r3', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 3,
            track: 'S2',
            title: 'Round 3: THE SLOW DRIFT NO ONE NOTICES',
            description: `Round description:

Even with performance metrics and skill tracking, leadership senses that some students are 
quietly deteriorating over time. 
Nothing dramatic happens in a single semester. But month after month, engagement drops, stress 
rises, and consistency weakens. 
The danger is not sudden failure. The danger is slow academic drift. 

What the Institution Gives You (Data) 
Data Provided: 
• Longitudinal monthly student trajectory data 
• Institutional monitoring and engagement signals 
• Indicators of consistency, volatility, stress, and academic load 
This shows how student journeys evolve over time, not just in snapshots.

NOTE: Sample inputs will be provided only when the submission portal opens.`,
            datasetPrefix: 'round3',
            questions: [
                { id: 'next_regime', type: 'select', label: '1.) Next Regime', placeholder: 'Select...', options: ['Growth', 'Stagnation', 'Decline'] },
                { id: 'decline_prob', type: 'number', label: '2.) Probability of Entering Decline (%)', placeholder: 'e.g. 65.2' },
                { id: 'engagement_change', type: 'number', label: '3.) Predicted Engagement Index Change', placeholder: 'e.g. -12.5' },
                { id: 'vis_proof_s2_r3', type: 'image', label: '4.) Drop your visualization', placeholder: 'Upload Image' },
                { id: 'feature_eng_s2_r3', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s2_r3', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 4,
            track: 'S1',
            title: 'Round 4: WHEN SUPPORT ARRIVES TOO LATE',
            description: `Round description:
The institution invests heavily in mentoring, counseling, training programs, and academic 
support. 
Yet some interventions fail silently. 
Why Interventions Fail: 
• Some are applied too late 
• Some are mismatched 
• Some create false confidence 
Support does not always equal improvement. 

What the Institution Gives You (Data) 
Data Provided: 
• Final-year readiness indicators 
• Intervention history and outcomes 
• Placement attempts, stress levels, support timing, and engagement metrics 
This reflects what happens when institutions try to help students.`,
            datasetPrefix: 'round4',
            questions: [
                { id: 'intervention_effect', type: 'select', label: '1.) Intervention Effectiveness', placeholder: 'Select...', options: ['Likely to Help', 'Neutral', 'Likely to Fail'] },
                { id: 'improvement_potential', type: 'number', label: '2.) Estimated Improvement Potential (Score/%)', placeholder: 'e.g. 45' },
                { id: 'placement_prob', type: 'number', label: '3.) Placement Success Probability (%) - Optional', placeholder: 'e.g. 70.5' },
                { id: 'vis_proof_s1_r4', type: 'image', label: '4.) Drop your visualization', placeholder: 'Upload Image' },
                { id: 'feature_eng_s1_r4', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s1_r4', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
        {
            id: 4,
            track: 'S2',
            title: 'Round 4: WHEN SUPPORT ARRIVES TOO LATE',
            description: `Round description:
The institution invests heavily in mentoring, counseling, training programs, and academic 
support. 
Yet some interventions fail silently. 
Why Interventions Fail: 
• Some are applied too late 
• Some are mismatched 
• Some create false confidence 
Support does not always equal improvement. 

What the Institution Gives You (Data) 
Data Provided: 
• Final-year readiness indicators 
• Intervention history and outcomes 
• Placement attempts, stress levels, support timing, and engagement metrics 
This reflects what happens when institutions try to help students.`,
            datasetPrefix: 'round4',
            questions: [
                { id: 'intervention_effect', type: 'select', label: '1.) Intervention Effectiveness', placeholder: 'Select...', options: ['Likely to Help', 'Neutral', 'Likely to Fail'] },
                { id: 'improvement_potential', type: 'number', label: '2.) Estimated Improvement Potential (Score/%)', placeholder: 'e.g. 45' },
                { id: 'placement_prob', type: 'number', label: '3.) Placement Success Probability (%) - Optional', placeholder: 'e.g. 70.5' },
                { id: 'vis_proof_s2_r4', type: 'image', label: '4.) Drop your visualization', placeholder: 'Upload Image' },
                { id: 'feature_eng_s2_r4', type: 'textarea', label: '5.) Give the feature engineering used metrics and formulas', placeholder: 'Enter metrics & formulas...' },
                { id: 'model_explanation_s2_r4', type: 'textarea', label: '6.) Explain the blocks of your ml model trained in short', placeholder: 'Explain model...' }
            ],
        },
    ];

    for (const r of rounds) {
        await prisma.roundContent.upsert({
            where: { id_track: { id: r.id, track: r.track } },
            update: {
                title: r.title,
                description: r.description,
                datasetPrefix: r.datasetPrefix,
                questions: r.questions as any,
            },
            create: {
                id: r.id,
                track: r.track,
                title: r.title,
                description: r.description,
                datasetPrefix: r.datasetPrefix,
                questions: r.questions as any,
            },
        });
    }

    console.log('Seeded system settings and round content.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
