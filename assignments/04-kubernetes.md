# Lab 4: Container orchestration with Kubernetes

The goal of this assignment is to become familiar with [Kubernetes](https://kubernetes.io), Google's container orchestration engine. It will play an important role in the next lab assignments, where you will deploy your own Machine Learning pipelines on a Kubernetes cluster.

## :mortar_board: Learning goals

- Understanding the concept of container orchestration
- Understanding the basic architecture of Kubernetes
- Being able to operate a Kubernetes cluster
  - Applying changes using manifest files
- Being able to manipulate Kubernetes resources
  - Pods
  - Controllers: ReplicaSets, Deployments, Services
  - Organising applications: Labels, Selectors
  - Jobs, CronJobs
- Deploying a multi-tier application on a Kubernetes cluster

## :memo: Acceptance criteria

- Demonstrate that your Kubernetes cluster is running and that you are able to manage it:
  - Open the dashboard to show what's running on the cluster: nodes, pods, services, deployments, etc.
  - Also show these from the command line (using `kubectl`)
- Show that all applications from this assignment are running on the cluster.
  - Show that you can access the following applications in a web browser:
    - The hello-world application from the Minikube tutorial
    - The echo application
    - The multi-tier guestbook application
  - Show that you can access the logs of both jobs
- Show that you can scale up and down the number of replicas of an application.
- Show that you can add, remove or change labels and selectors.
- Show that you can manipulate Kubernetes resources using labels and selectors.
- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository.
- Show that you updated the cheat sheet with the commands you need to remember.

## Additional resources

Kubernetes is a current topic that attracts a lot of interest. That also means that there's a lot of information available and that it's sometimes hard to find good intro-level resources. Here's a small selection that may help you get acquainted with Kubernetes:

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Learning Kubernetes](https://www.linkedin.com/learning/learning-kubernetes/) course at Linkedin Learning. Available for HOGENT students through [Academic Software](https://www.academicsoftware.eu).

If you think you will use Kubernetes professionally, or if you want to gain a much deeper understanding of how it works, the following resources may be of use:

- Martin, P. (2021) *Kubernetes: Preparing for the CKA and CKAD Certifications.* Apress
  - HOGENT staff and students have free access to the ebook from the campus or via VPN [through this link](https://doi.org/10.1007/978-1-4842-6494-2)
- Hightower, K. (2021) *Kubernetes The Hard Way.* Retrieved 2022-09-10 from <https://github.com/kelseyhightower/kubernetes-the-hard-way>
  - Instructions to set up Kubernetes manually. Anyone running Kubernetes in production should know the platform inside out. This guide helps you to install and configure all the necessary components, which is probably the best way to really understand how it works under the hood.

## 4.1. Set up the lab environment

For this lab assignment, you will need a Kubernetes cluster. You can either use a cloud-based solution (e.g. [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine)) or you can set up a local cluster on your own machine. The latter is the preferred option for this lab assignment. You need to install the following tools:

- `minikube`, a tool to set up a local Kubernetes environment (see the first step of <https://minikube.sigs.k8s.io/docs/start/> for installation instructions)
- `kubectl`, a command-line tool to run commands against Kubernetes clusters (see <https://kubernetes.io/docs/tasks/tools/#kubectl>)

It's probably best to [use Docker as the driver](https://minikube.sigs.k8s.io/docs/drivers/) for minikube. You can set this as the default driver with the command:

```console
minikube config set driver docker
```

Start Minikube with `minikube start` and follow [the instructions in the Minikube documentation](https://minikube.sigs.k8s.io/docs/start/) to get started. This tutorial will show you some basic commands to get started with Kubernetes and minikube, and will also show you how to deploy a basic hello-world application. Try to follow the tutorial and take notes of the commands you use.

A Kubernetes cluster can be managed with `kubectl`, but sometimes it's easier to have a visual dashboard. First enable the appropriate Minikube plugins:

```console
minikube addons enable metrics-server
minikube addons enable dashboard
```

Then start the Kubernetes dashboard in **a separate terminal** with:

```console
minikube dashboard
```

**Optionally,** issue the command `minikube node add` twice to spin up two extra nodes so you have an actual cluster with a control plane node and two workers.

By default, Minikube runs a single Kubernetes (control plane) node. For the purpose of this lab assignment, that's sufficient, but you will get a better feel of how a multi-node cluster works in a multi-node environment (control plane + worker nodes).

Remark that there's a command that immediately starts multiple nodes: `minikube start --nodes 3`. However, this command sometimes hangs during execution. Starting nodes individually is more reliable.

Also remark that when you're running a multi-node cluster, Minikube doesn't handle LoadBalancer access (which is the standard way to expose an application to the internet on a production cluster) very well. If you want to access a web application running on your cluster, you will probably need to enter the IP address of the node that actually runs the application Pod.

## 4.2. Basic operation

At this point, we assume you have a running instance of Minikube with at least a control plane node and that `kubectl` is configured to communicate with that instance.

Before you begin, a quick tip: the command `kubectl get all` is very useful to show you everything that is running on your Kubernetes cluster. Whenever you're changing the state of the cluster by creating new objects, you should check the changes with `kubectl get <object-type>` or just `kubectl get all`.

You can get an near real-time view on what happens on your cluster by issuing the following command in a separate Bash terminal:

```console
watch -n1 kubectl get all
```

:exclamation: This doesn't work in PowerShell, but you can use `watch` in Git Bash. You can also simulate the same behavior with a `while` loop in PowerShell:

```powershell
while (1) { kubectl get all; sleep 1 }
```

Add option `-o wide` if you want to see on which node each.

The `watch` command will repeat the `kubectl` command every second (`-n1`) and show the result.

### 4.2.1. Hello world!

Create your first deployment and service following the instructions in the [Hello Minikube tutorial](https://kubernetes.io/docs/tutorials/hello-minikube/). Check that you can view the app in a web browser.

:warning: Do not delete the resources unless you demonstrated your setup to your teacher or you are sure you can recreate them easily.

### 4.2.2. Working with manifest files

Usually, you won't be deploying applications with commands like you did in the previous step. You would write a manifest file that describes the desired state of all objects that are needed to run the application. Kubernetes manifest files are written in [YAML](https://yaml.org/).

In the directory [../kubernetes/4.2](../kubernetes/4.2), you will find examples of some basic manifest files:

- [echo-deployment.yml](../kubernetes/4.2/echo-deployment.yml): describes a deployment an echo app, it returns the received request to the client
- [echo-service.yml](../kubernetes/4.2/echo-service.yml): describes a service for the echo app
- [echo-all.yml](../kubernetes/4.2/echo-all.yml): a file containing both the deployment and service definition.
  - This Deployment also contains a ReplicaSet that ensures two pods are running at all times

You will notice that in the last file, some lines only contain `---`. This is YAML syntax to mark the beginning of a new "document" (in YAML terminology). This way, you can combine the definitions of all Kubernetes objects that you want to create in a single YAML file.

Let's deploy the application using the separate files first. Open a terminal in directory `4.2/` and follow the instructions below. Be sure to check the result after each command, or use the trick with the `watch` command introduced previously.

```console
kubectl apply -f echo-deployment.yml
kubectl apply -f echo-service.yml
```

This will first create the Deployment and launch the pods. The second command ensures that the app is available for users. When the Service is active, you should be able to view the application in a web browser with `minikube service echo-service`, or by surfing to `http://IP_ADDRESS:PORT` where `IP_ADDRESS` is the IP address of the node where the pod is running and `PORT` is the port number mentioned when you list the service with `kubectl get service`.

You can do the same thing in one go by combining the code of both files into a single file.

```console
kubectl apply -f echo-all.yml
```

Remark that this file is not an exact copy/paste of the previous ones. Indeed, each object should be given a name, and we chose different names for both deployments. Consequently, at this time, two instances of the same app are running at the same time.

Check all components that are currently running, try to access both instances of the service.

If you want to make a change to an existing Kubernetes object, edit the manifest file and run the command:

```console
kubectl apply -f <manifest-file.yml>
```

For example, increase the number of replicas of the echoserver app (currently two) in the manifest file `echo-all.yml`, and apply the change. Check whether this operation was successful and find out on which node each pod is running (which command can you use for this?). Try to send multiple requests to the service (e.g. `curl` in a for loop) and check whether all pods process requests by looking at the logs of each pod (with which command?).

**Optional:** If one of the nodes in the cluster becomes unavailable (e.g. `minikube node stop minikube-m03`). What happens? Is the application still available? Are the pods still running? Is a pod automatically rescheduled to another node? What if you restart the node? Will the cluster "heal" itself completely or not?

## 4.3. Labels and selectors

When you use Kubernetes in production, your environment will quickly become quite complex. An application will consist of several pods (frontend, API service, storage/database, etc.), deployments, etc. You may want to host several environments (development, staging/acceptance, production) on the same Kubernetes cluster.

In order to make sense of it all, you can add labels to all Kubernetes objects that you create. A label is nothing more than a key-value pair, both of which can be chosen freely. For example, you could define a key `environment` with possible values `development`, `acceptance` and `production`. If you consequently add the `environment` label to all pods that you launch, you can list e.g. all pods that are part of the `development` environment with so-called Selectors.

You can view labels with the command `kubectl get <item-type> --show-labels`. List the currently running pods with their labels.

You can search for Kubernetes resources with specific labels using the `--selector` or `-l` option, e.g.:

```console
kubectl get pods --selector TAG=VALUE
kubectl get pods --selector TAG!=VALUE
kubectl get pods --selector TAG=VALUE,TAG=VALUE
kubectl get pods -l 'TAG in (VAL1,VAL2,VAL3,...)'
kubectl get pods -l 'TAG notin (VAL1,VAL2,VAL3,...)'
```

You can also perform other actions using selectors, e.g.

```console
kubectl delete pods -l TAG=VALUE
```

This also works for other kinds of Kubernetes objects (Deployments, ReplicaSets, Services, etc.). You may also have noticed that services select pods based on labels, this way they aren't tightly coupled to specific pods.

### 4.3.1. Manipulating labels manually

Labels can be added to existing Kubernetes resources with `kubectl label <item> <key>=<value>`. Add the `--overwrite` option if the key already exists. A label can be removed with `kubectl label <item> <key>-` (i.e. add a dash to the end of the key name).

Add the label `application_type=demo` to the two pods that are part of the Deployment `echo-all-deployment`.

Try to change the `application_type` of one of the two pods to another value without the `--overwrite` option and note the error message. Add the option so the change is actually made.

Try to delete all pods with `application_type` equals to `demo`. Since this Deployment has a ReplicaSet that ensures 2 pods are launched, the deleted pods will be replaced immediately. What do you notice when you look at the labels of the two pods currently running?

Remove the `application_type` label from the pod that still has it.

Finally, remove all Kubernetes resources currently running on the cluster (Pods, Deployments, Services).

### 4.3.2. Setting labels in the manifest file

Usually, you won't be managing labels manually. They should instead be specified in the manifest file. You can add a section `labels:` to the `metadata:` section.

In the manifest file [4.3/example-pods-with-labels.yml](../kubernetes/4.3/example-pods-with-labels.yml), we defined a number of Pods with labels that are representative to how you could do it in practice.

Let's say you have an application that consists of 3 pods working together: a frontend, backend/API service and a database. You want to host a development, acceptance and production environment on this Kubernetes cluster. The app version running in production is currently v1.0, while acceptance and development are on v2.0. Each pod is owned by different teams (e.g. the web team develops the frontend, the db team manages the database, etc.).

This subdivision results in the following labels:

- `env`: can be either `development`, `acceptance`, or `production`
- `team`: either `web`, `api`, or `db`
- `pod_type`: either `frontend`, `backend`, or `db`
- `release_version`: `1.0` or `2.0`

Launch the pods by applying the manifest file.

- Select pods in the production environment
- Select pods *not* in the production environment
- Select pods in the development and acceptance environment (remark that logically, this is the same as the previous question, but you need to formulate your selector query differently)
- Select pods with release version 2.0
- Select pods owned by the API-team with release version 2.0
- Delete all pods in the development environment
- What is the quickest way to launch the pods you just deleted?

## 4.4. Jobs

Kubernetes can also be used to run batch jobs. These are tasks that are executed once and then stop. For example, you could use Kubernetes to run a Machine Learning pipeline that trains a model and then stops. Or you could use it to run a data pipeline that processes a batch of data and then stops.

In the manifest file [4.4/job.yml](../kubernetes/4.4/job.yml) a simple job is defined. It runs a container that computes pi to 2000 places and prints it out.

Apply the manifest file:

```console
kubectl apply -f job.yml
```

And check that the job is present in the cluster:

```console
kubectl get jobs --show-labels
```

You should see a label `job-name` being present in the output. This is because a Job is a special type of Controller. It is responsible for creating a Pod that runs the container.

Copy the label and its value and use it to list the Pod that was created by the Job:

```console
kubectl get pods -l <selector>
```

You should get one pod as output. Copy the name of the pod and use it to view the logs of the pod:

```console
kubectl logs <pod-name>
```

By this time you should see pi in the output. If not, wait a few seconds and try again or use the `-f` option to follow the logs.

If you want to run a job periodically, it's called a CronJob. Follow the tutorial [Running automated tasks with CronJobs](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/). The necessary manifest file is available in the directory [../kubernetes/4.4](../kubernetes/4.4). Keep lab notes!

## 4.5. Deploy a multi-tier web application

Next up is a more complex example: a multi-tier web application. The application consists of three components:

- A frontend web application
- A master database (Redis)
- Two replica databases (Redis)

> Note: this example does not work on Minikube when using multiple nodes. So make sure to remove the extra nodes you may have added earlier.

Open the Kubernetes documentation site in a web browser and follow the tutorial [Deploying PHP Guestbook application with Redis](https://kubernetes.io/docs/tutorials/stateless-application/guestbook/). Keep lab notes! It's a good idea to copy the manifest files to your own repository so you can easily find them later.

If everything went well, you should be able to submit messages which remain visible after reloading the page. The guestbook application looks like this:

![Guestbook application](./img/04-kubernetes/guestbook.png)

## 4.6. Clean up

**When giving a demo, make sure all manifest files (4.2, 4.3, 4.4 and 4.5) are applied** and that the applications are running.

**Only after successfully demonstrating your setup**, you can clean up all Kubernetes resources currently running on the cluster. What is the quickest way to delete all objects?

Also delete the Minikube cluster with the following command:

```console
minikube delete
```

## Possible extensions

- Add one or more extra nodes to your Kubernetes cluster and experiment with the multi-node setup
- Try to deploy one or more apps from the [DigitalOcean Kubernetes Sample Apps](https://github.com/digitalocean/kubernetes-sample-apps)
  - These applications make use of [namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) and [Kustomize](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/). Deploy the apps and try to understand how they work and how they are configured. The repository contains a `README.md` file per app with instructions for deployment.
  - You should be able to deploy the following apps: bookinfo, emojivoto and podinfo. The other apps require extra software to be installed, you can ignore these apps or experiment with them if you want.
