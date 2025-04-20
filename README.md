# CIS 3500: Lunch Lotto Upgrade

## Overview
This assignment involves enhancing a Chrome extension developed by one of the Top 3 winners of the MCIT hackathon. The project provides hands-on experience in web development, API integration, and collaborative coding.

**Original project:** [Lunch Lotto](https://github.com/jessie-sr/lunch-lotto)

## Project Description
Lunch Lotto is a Chrome extension that helps users decide where to eat by randomly selecting nearby restaurants. Your task is to enhance this extension by implementing new features.

## Enhancements
Choose one of the following enhancements to implement:

1. **History Feature**: Maintain a log of all restaurants chosen by the user (Implemented by Alan)
2. **Alternative API Integration**: Replace Google Maps API with another restaurant data provider (Implemented by Abdullah)
3. **Progress Indicator**: Add a progress bar to indicate the status of API calls (Implemented by Abdullah)
4. **Restaurant Filtering**: When fetching restaurants, filter out restaurants that are closed (Implemented by Alan)

## Getting Started

### Step 1: Team Organization
- Assign a team member as the **Product Manager (PM)** for Lunch Lotto.
- Ensure this PM is different from the one assigned to the Nara project.

### Step 2: Repository Setup
The PM should fork the repository:
1. Navigate to the `lunch-lotto-starter` repository on GitHub.
2. Click the **Fork** button to create a copy under their account.

### Step 3: Cloning the Repository
Once the PM has forked the repository, team members should clone it locally:
```sh
git clone https://github.com/<PM-username>/lunch-lotto-starter.git
```

### Step 4: Development Workflow
1. Open the project in a text editor (e.g., **Visual Studio Code** recommended).
2. Make changes to the codebase.
3. Use the following commands to commit and push your changes:

```sh
git add .
git commit -m "feat: [feature name] added"
git push
```

4. As team members contribute, collaborate using **Pull Requests (PRs)** on GitHub.
5. Regularly sync your local repository with the latest changes:

```sh
git pull
```

6. Resolve merge conflicts as needed and ensure smooth integration.

## Submission
- Submit the final version of your project as per website guidelines.
- Include a brief write-up of your implemented features and any challenges faced.

## Setup Foursquare API Key

### Replace the Google Maps API Key:

1. Open the popup.js file in a code editor (e.g., VS Code).
2. Find the line containing:
   ```js
   const apiKey = "YOUR_API_KEY";
   ```
3. Replace "YOUR_API_KEY" with your own Foursquare API Key.
   Example:
   ```js
   const apiKey = "AIzaSy12345EXAMPLE";
   ```
---
Happy coding, and good luck with Lunch Lotto! 🍀
