# Project Title
Study Buddy

## 1. Project Description
StudyBuddy is a browser-based web application to help students to keep track of their study and manage their time by providing tools to record study time and personalized insights based on performance.
 

## 2. Names of Contributors
List team members and/or short bio's here... 
* Hi, my name is Shinyoung! I am excited to start this journey of creating a web application!
* Hi, I am Kiana! I am excited to start this journey of creating a web application!
* Hi, My Name is Ramandeep Kaur, I am 22 years old, I am new to computer language.
	
## 3. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)

## 4. Complete setup/installion/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
1. Command: git clone https://github.com/shinyoungyou/1800_202430_DTC13.git
2. Find index.html page and click on "Go Live"
3. Use mock user account: email=maria@email.com, password=password

## 5. Known Bugs and Limitations
Here are some known bugs and limitations:
* Ranking system: To meet our project goal of staying motivated, we plan to work on the ranking system for the group feature during the winter break, as there is currently no functionality after students join a group.
* Database redesign: The current database structure is too complicated, with a two-level depth in subcollections.
* Code refactoring: Refactor specific files, such as log.js, to make our function do one thing. 

## 6. Features for Future
What we'd like to build in the future:
* Notification system: Notify students when a new member joins their group.
* hatting system: Let study group members to share updates on their studies and exchange tips.
* Insights pie chart: Add a pie chart on the insights page to show which subject a student studied most on the day.
	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── README.md                # Documentation for the project  
├── index.html               # landing HTML file, this is what users see when you come to url
├── main.html                # Main page as a starting point 
├── home.html                # Home page for managing tracking study progress
├── log.html                 # Page for logging study sessions
├── daily_insights.html      # Insights page displaying daily study satistics
|── planner.html             # Page for managing study plans 
├── groups.html              # Page for managing and joining study  groups
├── planner.html             # Page for more details of user's daily study logs
├── setting.html             # Settings page for user preferences  
└── tailwind.config.js       # Configuration file for Tailwind CSS styling  

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
├── /avatar.png              # Avatar image for user profile
├── /background-logo.png     # Logo with background color
├── /logo.png                # Main logo
├── scripts                  # Folder for scripts
├── /authentication.js       # Handles user authentication        
├── /daily_insights.js       # Logic for the daily insights page  
├── /groups.js               # Manage group functionality  
├── /home.js                 # Manage the homepage logic  
├── /log.js                  # Manage study session logging  
├── /main.js                 # Manage welcome banner
├── /monthly_insights.js     # Logic for monthly insights  
├── /planner.js              # Manages more deatils about daily study logs
├── /script.js               # Shared scripts across the app  
├── /setting.js              # Handles user settings functionality  
├── /skeleton.js             # Skeleton loading components  
├── /weekly_insights.js      # Logic for weekly insights  
├── styles                   # Folder for styles
├── /style.css               # Main stylesheet for consistent design across the app  
├── text                     # Folder for resuable components
└── /nav_after_login.html    # Navbar after logged in


