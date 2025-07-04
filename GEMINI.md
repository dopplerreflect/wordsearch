## Gemini Workflow Instructions

When making changes in this project, please follow the Jujutsu-based workflow described below.

1.  **Describe the Change:** Before you start implementing a change, describe your intended change by running the command:
    ```bash
    jj desc -m "A brief but clear description of the change."
    ```

2.  **Implement and Verify:** Proceed with making the necessary code modifications. After you have implemented the changes, wait for my verification.

3.  **Start a New Change:** Once I have verified your changes, run the following command to commit the current set of changes and create a new, empty change for the next task:
    ```bash
    jj new
    ```
To create a new word list, create a list of 42 words related to the requested subject and format it as a json array. Store it in @src/lib/words/Subject.json. Make sure that the first letter of each word is captalized.
