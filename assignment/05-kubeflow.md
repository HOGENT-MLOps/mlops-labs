# Lab 5: Kubeflow

The goal of this assignment is to become familiar with [Kubeflow](https://www.kubeflow.org/), a machine learning toolkit for Kubernetes. In a previous lab you created an ML pipeline with Azure ML, which is a managed service. Kubeflow is an open source project that can be used to create ML pipelines on any Kubernetes cluster. In this lab you will use Kubeflow Pipelines to create an ML pipeline and deploy it to a Kubernetes cluster. Many of the steps in this lab are similar to the steps in the previous lab, but the tools are different. Azure ML is a managed service, which even might use Kubeflow under the hood.

TODO: does Azure ML use Kubeflow?

## :mortar_board: Learning goals

TODO: add learning goals

## :memo: Acceptance criteria

TODO: add acceptance criteria

- De student kent de werking van TensorFlow Lite
- De student kan verschillende use-cases identificeren en uitleggen waarvoor een ML-model op de edge
  vereist is.
- De student kan de verschillende technieken uitleggen die worden gebruikt om een ML-model te optimaliseren
  voor edge-devices, zoals kwantisatie en pruning.
- De student kan TensorFlow Lite gebruiken om een ML-model te converteren en te optimaliseren voor implementatie
  op edge devices.
- De student kan de prestaties van het gemigreerde ML-model op de edge evalueren en optimaliseren.

## 5.1 Setup Kubeflow

Running Kubeflow locally is tricky because we'll be using the raw Kubernetes manifest files. The [Kubeflow documentation](https://www.kubeflow.org/docs/started/installing-kubeflow/) doesn't recommend to run these raw files and to run Kubeflow in the cloud. For this lab we'll be running a slimmed down version of Kubeflow locally. This version is not recommended for production use, but it's good enough for this lab. This section is entirely based on the following documentation: <https://www.kubeflow.org/docs/components/pipelines/v1/installation/localcluster-deployment/#deploying-kubeflow-pipelines>.

export PIPELINE_VERSION=2.0.1
kubectl apply -k "github.com/kubeflow/pipelines/manifests/kustomize/cluster-scoped-resources?ref=$PIPELINE_VERSION"
kubectl wait --for condition=established --timeout=60s crd/applications.app.k8s.io
kubectl apply -k "github.com/kubeflow/pipelines/manifests/kustomize/env/platform-agnostic-emissary?ref=$PIPELINE_VERSION"
kubectl wait pods -l application-crd-id=kubeflow-pipelines -n kubeflow --for condition=Ready --timeout=1800s
kubectl port-forward -n kubeflow svc/ml-pipeline-ui 8080:80

kubectl delete -k "github.com/kubeflow/pipelines/manifests/kustomize/env/platform-agnostic-emissary?ref=$PIPELINE_VERSION"
kubectl delete -k "github.com/kubeflow/pipelines/manifests/kustomize/cluster-scoped-resources?ref=$PIPELINE_VERSION"

### 5.1.1 Start a Kubernetes cluster

First, we need to start a Kubernetes cluster. We'll be using [Minikube](https://minikube.sigs.k8s.io/docs/), which you should already have installed. If not, please complete the [previous lab](./04-kubernetes.md) first.

We need a bit more compute power for Kubeflow, so we're starting two k8s nodes with 4 CPUs and 8 GB of memory. Start Minikube with the following command:

```bash
minikube start --nodes 2 --cpus 4 --memory 8192
```

> Note: you may need to remove the cluster from the previous lab.
>
> **Beware:** do not remove the cluster if you didn't do your demo yet!

### 5.1.2 Install Kustomize

The installation of Kubeflow requires [Kustomize](https://github.com/kubernetes-sigs/kustomize). Kustomize is a tool that lets you customize raw Kubernetes manifest files, it's like [`make`](https://www.gnu.org/software/make/) but for Kubernetes.

Navigate to the `kubeflow` folder and download Kustomize using the documentation: <https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/>.

> :warning: Windows users should do this in Git bash.

### 5.1.2 Install Kubeflow

Next, we need to install Kubeflow. We'll be using the [Kubeflow manifests](https://github.com/kubeflow/manifests) repository. Clone the repository in a folder named `kubeflow`:

```bash
git clone https://github.com/kubeflow/manifests.git kubeflow
```

> :warning: These files don't need to be pushed to your GitHub repository. So, please clone the repository in a folder that is not part of your repository.

Navigate to the `kubeflow` folder and run the following command:

```bash
while ! kustomize build example | awk '!/well-defined/' | kubectl apply -f -; do echo "Retrying to apply resources"; sleep 10; done
```

This command will install Kubeflow on your Kubernetes cluster. It might take a while, so please be patient. You can check the status of the installation with the following command:

```bash
kubectl get pods -A
```

Or if you only want to see the pods which aren't running yet, run this command:

```bash
kubectl get pods -A --field-selector status.phase!=Running
```

You could make this interactive by running the command every second by using `watch`:

```bash
watch -n 1 kubectl get pods -A --field-selector status.phase!=Running
```

### 5.1.3 Access Kubeflow

Once Kubeflow is up and running, we can access the dashboard using port forwarding. Run the following command to forward the dashboard to port 8080:

```bash
kubectl port-forward -n kubeflow svc/ml-pipeline-ui 8080:80
```

Now, you can access the dashboard by navigating to <http://localhost:8080>. You should see the following screen:

![Kubeflow dashboard](img/05-kubeflow/kubeflow-dashboard.png)

## Possible extensions
