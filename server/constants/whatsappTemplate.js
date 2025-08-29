exports.job = [
  {
    id: "job_posting_with_direct_link ",
    name: "Mail Job Posting Fill Up Remainder",
    header: "New Job Opportunity Alert!",
    body: `Hello!  
A new job opportunity has been posted by your placement department.

🗓️ Deadline to apply: {{1}}  
⏰ Time: {{2}}
🔗 Apply now: {{3}}

Don't miss this opportunity to shape your future!`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Deadline", "Time", "Link"],
    },
  },
  {
    id: "job_posting_with_company_and_email",
    name: "job Posting: Company Name and email check up",
    header: "New Opening at {{1}}",
    body: `Heads up!  
Your placement department has shared a new job opening at {{1}}.

📅 Application deadline: {{2}}  
⏰ Time: {{3}}
🔍 Role: {{4}}  
📧 Please check your email for detailed information.

Apply soon via the shared link.`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      header: ["Company Name"],
      body: ["Company Name", "Deadline", "Time", "Role"],
    },
  },
];

exports.reminder = [
  {
    id: "reminder_final_call",
    name: "Final Call",
    header: "Final Reminder!",
    body: `Hi there!  
  This is the final call from your placement department.
  
  🕒 Task: {{1}}  
  ⏳ Deadline: {{2}}  
  ⏰ Time: {{3}}  
  
  Please act immediately to avoid missing out.`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Task", "Deadline", "Time"],
    },
  },
  {
    id: "reminder_general_action_required",
    name: "General Action Required",
    header: "Action Required Reminder",
    body: `Hey!  
This is a reminder from your placement department regarding a pending task.

📌 Task: {{1}}  
📅 Deadline: {{2}}
⏰ Time: {{3}}

Please complete it at the earliest.`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Task Name", "Deadline", "Time"],
    },
  },
  {
    id: "reminder_exam_submission",
    name: "Exam Submission Remainder",
    header: "Assessment Submission Reminder",
    body: `Hi!  
You have an assessment/exam scheduled by {{1}}.  

🗓️ Deadline: {{2}}  
⏰ Time: {{3}}
📝 Make sure to complete it before the deadline.

Wishing you the best!`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Scheduler Name", "Deadline", "Time"],
    },
  },
  {
    id: "reminder_apply_job_check_mail ",
    name: "Job Application Deadline Remainder",
    header: "Application Deadline Reminder",
    body: `Hello!  
This is a gentle reminder from your placement department.  

You have a pending job application to complete.  
📧 Please check your email for details.  
🗓️ Deadline: {{1}}
⏰ Time: {{2}}

Don’t miss this opportunity!`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Deadline", "Time"],
    },
  },
];

exports.form = [
  {
    id: "form_topic_specific",
    name: "Specific Form Submission",
    header: "{{1}} Form Submission",
    body: `Hello!  
    The placement department has shared a form regarding **{{1}}**.
    
    🗓️ Deadline: {{2}}  
    ⏰ Time: {{3}}
    🔗 Form link: {{4}}  
    
    Please submit it before the deadline.`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      header: ["Name of form Submission"],
      body: ["Name of form Submission", "Deadline", "Time", "Link"],
    },
  },
  {
    id: "form_fill_deadline_reminder",
    name: "Form Deadline Message",
    header: "Form Submission Required",
    body: `Hi there!  
Your placement department has shared a new form that needs to be filled.

📅 Deadline: {{1}}  
⏰ Time: {{2}}
🔗 Form link: {{3}}

Please complete it before the deadline.`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Deadline", "Time", "Link"],
    },
  },
  {
    id: "form_direct_link_only ",
    name: "Form Fill Up Message",
    header: "Action Required: Form Submission",
    body: `Hey!  
Please fill the following form shared by your placement department:

🔗 {{1}}

Your response is important!.`,
    footer: "Campus Recruitment Gateway",
    variableMapping: {
      body: ["Link"],
    },
  },
  {
    id: "form_general_notification ",
    name: "Mail sent form fill up remainder",
    header: "Fill the Shared Form",
    body: `Hello!  
A new form has been shared with you by your placement department.

Kindly fill it out at the earliest to avoid missing out.

Check your email or click the provided link.`,
    footer: "Campus Recruitment Gateway",
  },
];
