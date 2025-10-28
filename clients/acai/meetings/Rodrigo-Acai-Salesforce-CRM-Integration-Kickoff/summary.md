General Summary


AI Apps
Integration Prioritization: Team chose Front CRM connector first due to client demand and easier API access.
Two-way Communication: Integration will sync data bi-directionally between Front and Asai, supporting audit trails for compliance.
Focus Areas: Initial product features include internal notes and draft emails, with AI responses planned for future phases.
Next Steps: Rodrigo will explore Front’s API, while Elena will document integration priorities for the team.
Collaboration Process: Structured onboarding includes demos, documentation sharing, and continuous technical alignment via Slack.
User Experience: Clear audit trails and AI transparency are critical for maintaining compliance in customer interactions.
Action items
Pedro Rodrigo Medina Osorio
Research Front CRM features, APIs, event webhooks, and sandbox availability for building the connector (38:37)
Engage Sergey in Slack for detailed technical discussions and code access (19:16)
Analyze and document integration requirements and technical discovery points for Front and Salesforce platforms (39:44)
Review and understand product capabilities with Lena including current Zendesk integration demo and documentation (18:13)
Sergey
Provide Rodrigo with access to the company GitHub and technical documentation related to connectors (19:16)
Participate in technical Slack channel to collaborate on API integration guidance and troubleshooting (11:22)
Elena Levi
Create comprehensive documentation summarizing integration priorities, feature sets, and product functionalities for Rodrigo (31:45)
Facilitate product demo session with Lena and new hire Camilla for onboarding and knowledge transfer (18:13)
Manage commercial discussions with Rodrigo separate from current technical onboarding (19:33)
Coordinate information handoff and follow-up communications to Rodrigo post-call (40:11)
Lena
Conduct detailed product capability walkthrough and provide Rodrigo with relevant documentation during the meeting (18:13)
Notes
Integration Strategy and Prioritization
The team decided to prioritize building the Front CRM connector over Salesforce due to higher client demand and easier API access, despite Rodrigo’s stronger Salesforce experience (10:04).

Elena Levi explained that multiple clients requested Front, while Salesforce is mainly for one client, making Front more strategically valuable.
Front’s APIs are more open and modern, reducing red tape for integration, which also influenced the decision.
Rodrigo will conduct research on Front’s APIs and features as the next step to align technical efforts.
This choice positions the product to better meet market needs quickly, accelerating client onboarding and reducing time to value.
Technical Integration Approach
The integration will function as an adapter that listens for new cases in Front and syncs data bi-directionally with Asai’s system (14:53).

When Front signals a new case ID, Asai’s connector pulls detailed data like email body, subject, and custom fields via Front’s API.
Actions such as posting internal notes, annotations, or email drafts originate from Asai and are sent back to Front through API calls, enabling two-way communication.
Rodrigo clarified that this adapter model differs from a generic, cross-platform tool, focusing on deep integration with CRM-specific APIs for tighter data sync.
The integration supports audit trails, avoiding approaches like Chrome extensions that lack traceability, which is critical for compliance and customer experience.
Product Feature Alignment and Workflow
The current product model outputs internal notes, case summaries, and suggested email drafts to the agent’s CRM interface, which agents copy into responses (22:55).

Elena demonstrated Zendesk’s setup where case data triggers API calls to external GDS systems for travel penalties and refund calculations, which are then summarized in internal notes.
The email draft is pre-filled with contextual info but requires manual copy-paste by agents, ensuring human review before sending.
Future phases include AI-driven direct responses to travelers, marked clearly as AI-generated, but initial focus remains on internal assistance to agents.
Rodrigo emphasized the importance of understanding Front’s UI capabilities to determine where notes and drafts can appear, preferring inline case integration over side panels.
Scope Clarification and Next Steps
The team agreed to start with internal note and draft email insertion in Front as the first phase, deferring direct outbound messaging to later phases (30:54).

Rodrigo will investigate Front’s API documentation, including sandbox availability, to verify feasibility of inserting drafts and notes.
Elena committed to compiling all technical questions and integration priorities into a formal document for Rodrigo’s reference.
Ongoing communication will move to Slack for detailed discussions, with Sergey providing technical support and GitHub access (19:16).
Commercial discussions remain pending but are not expected to block technical progress, allowing development to advance in parallel.
Operational Considerations and User Experience
The integration must handle agent identification and multi-agent case handling, though Asai primarily reads CRM data rather than managing agent assignments (32:25).

Elena explained that AI-generated notes appear as a special AI travel agent within the CRM but do not interact directly with agents initially.
Rodrigo flagged potential challenges around sharing draft emails among agents, citing past Salesforce experience where drafts are user-specific and cannot be shared mid-edit.
The team agreed the draft emails are templates with pre-filled info rather than editable shared drafts, mitigating this risk.
Clear audit trails and visibility into AI involvement are key to maintaining compliance and transparency in customer interactions.
Team Collaboration and Knowledge Transfer
The meeting established a clear handoff process involving product demos, documentation sharing, and technical deep dives to onboard Rodrigo effectively (18:13).

Lena will lead the product capability overview and documentation walkthrough with Rodrigo and the new GDS expert, Camilla, during this meeting phase.
Sergey and Rodrigo will continue the technical API exploration offline via Slack to align on connector development specifics.
Elena emphasized the iterative nature of discovery, expecting new questions and adjustments as integration progresses.
This structured collaboration aims to reduce onboarding time and ensure all team members have the necessary context and access to accelerate delivery.

https://app.fireflies.ai/view/Rodrigo-Acai-Salesforce-CRM-Integration-Kickoff::01K8DQZ4DCZNABXQZSY4K6RQD9