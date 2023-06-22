# Lab 2: Continuous Integration/Delivery with Jenkins

In this lab assignment, you will learn the basics on how to set up a build pipeline with Jenkins. In this lab assignment, we will install and run a Jenkins server natively on a VM, and deploy a sample application using a build pipeline.

> Windows users are advised to use the Git bash shell for this lab assignment. The commands below are written for a bash shell.

## :mortar_board: Learning Goals

- Creating simple jobs and build pipelines
- Running the pipeline to build and test an application, and to deploy changes in the application

## :memo: Acceptance criteria

- Show that you created a GitHub repository for the sample application
- Show that the application is running by opening it in a web browser
- Show the overview of jobs in the Jenkins dashboard
- Make a change to the sample application, commit and push
- Launch the build pipeline and show the change to the application in the browser
- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository
- Show that you updated the cheat sheet with the commands you need to remember

## 1.1 Set up the lab environment

For this lab assignment, we'll be using the `cicdlab` environment. This environment comes with Jenkins and Docker, both natively installed on the VM. Docker will be used to run the sample app, and Jenkins will be used to build and test the application.

First, we'll need to install the required Ansible roles for provisioning the VM. Run the following command from the root of the repository:

```console
bash ./scripts/role-deps.sh ./cicdlab/ansible/site.yml
```

Then, start the `cicdlab` VM:

```console
cd cicdlab
vagrant up
```

## 1.2 Build and verify the sample application

Now it's time to verify the sample application can be built and run. The application is a simple web application that displays a blue page with some text. The application is written in Python and uses the Flask framework. The application is packaged as a Docker image, and the build process is automated with a shell script.

1. Log in to the VM with `vagrant ssh` and go to directory `/vagrant/cicd-sample-app`
2. Build the application using the `sample-app.sh` script. The build script will likely not be executable, so keep that in mind. Downloading the image may take a while since it's almost 900 MB. After the build is finished, your application should be running as a Docker container.
3. Verify the app by pointing your browser to <http://192.168.56.20:5050/>. You should see the text "You have successfully deployed a sample app using Docker and Jenkins." with a blue background.
4. Stop the container and remove it.

## 1.3 Create a GitHub repository for the sample application

You will also need a GitHub repository with a sample application. Create a new Git repository on your physical system, where Git and access to GitHub is already configured. Some starter code is provided in directory [cicd-sample-app](../cicdlab/cicd-sample-app/).

1. Ensure that Git is configured, e.g. with `git config --global --list` and check that `user.name` and `user.email` are set. If not, make the necessary changes:

    ```console
    git config --global user.name "Bobby Tables"
    git config --global user.email "bobby.tables@student.hogent.be"
    ```

2. Copy the starter code from `cicd-sample-app` to some new directory outside this Git repository. Enter the copied directory and initialize it as a Git repository with `git init`. Commit all code (e.g. `git add .; git commit -m "Initial commit of sample application"`).
3. On GitHub, create a new public repository and record the URL, probably something like `https://github.com/USER/cicd-sample-app/` (with USER your GitHub username).
4. Link your local repository with the one you created on GitHub: `git remote add origin git@github.com:USER/cicd-sample-app.git` (The GitHub page of your repository will show you the exact command needed for this).
5. Push the locally committed code to GitHub: `git push -u origin main`

## 1.4 Configure Jenkins

As mentioned before, we'll use Jenkins to build the application. Jenkins is already installed on the VM but it's not configured yet. Let's do that now!

1. Open a browser tab and point it to <http://192.168.56.20:8080/>. You are asked for a username and password. The username and password for this setup is both `admin`.
   - Obviously, this is not a secure setup. In a real-world setting, you would use at least a different and more complex password for the admin user. But for this lab assignment, it's fine.
2. Next, Jenkins will ask which plugins you want to have installed. Choose to install the recommended plugins. After this, Jenkins will initialize, which takes some time. You can follow the progress on the web page.
3. When the initialization process finishes, you'll see a page titled "Instance Configuration", just click "Save and Finish" and then "Start using Jenkins".

Jenkins is now ready to use! You can always access the Jenkins dashboard by pointing your browser to <http://192.168.56.20:8080/>.

## 1.5 Use Jenkins to build your application

1. On the Jenkins dashboard, click "Create a new job". Enter a suitable name, e.g. *BuildSampleApp*. Select a "freestyle project" as job type.
2. The following page allows you to configure the new job. There are a lot of options, so you may be overwhelmed at first.
    - Optionally, enter a description
    - In the section "Source Code Management", select the radio button "Git" and enter the https-URL to your GitHub project, `https://github.com/USER/cicd-sample-app.git`
    - Since your repository is public it is not necessary to enter credentials.
    - The branch to be built should be `*/main` instead of the default `*/master`
    - In the section "Build Environment", tick the "Delete workspace before build starts" checkbox. This ensures that the build process always starts from a clean slate.
    - In the section "Build Steps", click "Add a build step" and select "Execute shell" from the dropdown list. enter `bash ./sample-app.sh`
    - Click "Save". You are redirected to the Jenkins dashboard.
3. The dashboard shows an overview of all build jobs. Click the job you just created and in the menu on the left, start a new build job.
    - Hopefully, the build succeeded. Use the overview of build attempts to view the console output of the build process. If the build process failed this is where you can find error messages that can help to determine the cause.
    - If the build failed, do not modify the source code or the build script. Instead, try to find out what went wrong and fix it. Then, start a new build job.
4. Ensure the application is running by reloading the appropriate browser tab.

Take some time to realize what you did here, because it's actually quite cool! We launched a new Docker container that runs our sample application, and we did it from Jenkins. This is a very simple example of how you can use Jenkins to automate your build process.

## 1.6 Add a job to test the application

We will now create another job that runs an acceptance test after the build process has finished. Our acceptance test will consist of running the `curl` command from the Jenkins server, which will send a request to the application and check if the response contains the expected text.

1. On the Jenkins dashboard, click "Create a new job". Enter a suitable name, e.g. *TestSampleApp*. Select a "freestyle project" as job type. Optionally, add a description.
2. Under section "Build Triggers", select checkbox "Build after other projects are built". In the text field "Projects to watch", enter the name of the build job.
3. Under section "Build steps", add a build step of type "Execute shell". Enter the following code:

    ```bash
    curl http://192.168.56.20:5050/ | grep "Machine Learning Operations"
    ```

4. Save and run the job to verify if it succeeds

    Jenkins can determine whether the job succeeded or failed using the exit status of the command given. When `grep` finds a matching line in the standard output of `curl`, it will finish with exit status 0 (indicating success). If not, it will have exit status 1 (indicating failure). If the command returns a nonzero exit status, it will consider the job to be failed.

    Remark that this is not exactly a full-fledged acceptance test. In a real-life application, you would probably launch a test suite that has to be installed on the Jenkins server.

    You could write a bash script that's a bit more useful than the command specified above. For example, if the job fails, the console output will not give you any clue as to why. In case of a failure to find the expected IP address in the output of `curl`, you could print the actual output on the console.

5. The Jenkins dashboard should now list both the build and test job. Stop and remove the `samplerunning` container and then launch the build job.

## 1.7 Create a build pipeline

The build process in a real-life application is usually much more complex. A full-fledged Continuous Integration/Delivery (CI/CD) pipeline will usually consist of more steps than the ones discussed here (e.g. linting, static code analysis, unit tests, integration tests, acceptance tests, performance tests, packaging and deployment in a production environment). This lab assignment, probably your first encounter with a CI/CD tool, is a bit simpler, but should give you an idea of what's possible.

In the next step, we will set up a complete build pipeline that, if the build and test steps succeed, will launch your application as a Docker container.

1. Go to the Jenkins pipeline and create a new item. Enter an appropriate name (e.g. *SampleAppPipeline*) and select "Pipeline" as job type. Press OK.
2. Optionally, enter a description and in the Pipeline section, enter the following code:

    ```text
    node {
        stage('Preparation') {
            catchError(buildResult: 'SUCCESS') {
                sh 'docker stop samplerunning'
                sh 'docker rm samplerunning'
            }
        }
        stage('Build') {
            build 'BuildSampleApp'
        }
        stage('Results') {
            build 'TestSampleApp'
        }
    }
    ```

    This build pipeline consists of 3 stages:

    - The currently running container is stopped and removed. If one command fails, this stage will be marked as successful anyway. This is because the container may not be running yet, in which case the `docker stop` command will fail.
    - The build job is launched.
    - The acceptance job is launched.

    Be sure to enter the correct names of the jobs if you have chosen your own names! Finally, save the pipeline.
3. Next, start a build. Jenkins will show you how each phase of the pipeline progresses. Check the console output of each phase.
4. If the run succeeds, the application should be running. Verify by opening it in a web browser.

## 1.8 Make a change in the application

In this final step, we will make a change in the application, re-launch the build pipeline and view the result in the browser.

1. Go to your local copy of the Git repository with the sample application. Open file `static/style.css` and change the page background color from `lightsteelblue` into whatever you want.
2. Save the file, commit your changes and push them to GitHub.
3. In the Jenkins dashboard, launch the build pipeline.
4. Reload the application in the web browser, it should have a different background color now!

## Reflection

This lab assignment was much less complex than a real-life build pipeline would be, but you were able to see how Jenkins can be used to build, test *and* deploy an application automatically.

What would change in a real-life case:

- The Git repository would probably be maintained on the Jenkins build server, or a dedicated internal server instead of GitHub. That opens the possibility to trigger a Jenkins build on each push to the central Git repo.
- If GitHub is used, the repository is likely to be private. In that case, you have to configure Jenkins, so it has the necessary credentials to download the code from GitHub, an [access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token).
- The build pipeline would probably be much more elaborate, with linting, static code analysis, unit tests, functional, integration, acceptance and performance tests...
- Jenkins would probably package the application (if the build succeeded) and upload it to a package repository.
- In this lab, the application is stopped during the build process. This is of course not desirable on a production server. Usually, you would have the application running on multiple web server instances with a load balancer to distribute client requests to each instance. Deploying the application would consist of launching containers with the new version of the code, and removing those with the old version.
- Depending on the situation, it may be decided that the deployment phase is never done automatically, but manually after a successful build. This is the difference between *Continuous Integration* (no automatic deployment) and *Continuous Delivery*.

And we haven't even discussed any necessary changes to a database schema when new code is deployed!

## Possible extensions

- Create a build pipeline for a larger application, e.g. the [Docker Getting Started tutorial](https://github.com/docker/getting-started)
  - Make sure to start the container in the background, so the build step can finish!
- There is also a [todo app](https://github.com/docker/getting-started/tree/master/app) in the GitHub repository above. Create a build pipeline for this app.
  - You may need to create a new GitHub repository with only the contents of the `app` folder.
  - Use this tutorial for guidance: <https://learn.microsoft.com/en-us/visualstudio/docker/tutorials/docker-tutorial>
- Try an app of your choice

## Cleanup

You can remove the virtual machine using the following command **after demonstrating the result**. Removing the virtual machine before demonstrating the result will result in losing all your work!

```bash
vagrant destroy -f
```
