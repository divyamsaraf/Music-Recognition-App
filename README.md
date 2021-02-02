##### Music-Recognition-App


About ACRCloud:
What is ACRCloud?
ACRCloud is the first open cloud platform of Automatic Content Recognition ( ACR ) services based on Audio Fingerprinting technology.

ACRCloud provides various Audio Recognition Services for various requirements such as find music by sound, monitor media on radio & TV, detect TV channels for multi-screen interactions, copyright detection and etc.

Why Choose ACRCloud?
ACRCloud is the champion of MIREX2015 Audio Fingerprinting Task, organized by the International Music Information Retrieval Systems Evaluation Laboratory (IMIRSEL) at the Graduate School of Library and Information Science (GSLIS), University of Illinois at Urbana-Champaign (UIUC).

The recognition rate of ACRCloud is above 98% in normal environment and the average recognition speed is 3~5 seconds.

ACRCloud is trusted by great companies like Alibaba, XiaoMi, LeTV, LeCloud, WeiBo, CCTV, SoundCharts, LyricsMania, etc.
Music Database: They offer one of the world’s largest music fingerprint databases of over 72 million tracks which is constantly being updated.
3rd Party ID Integration
ACRCloud Music Recognition Services allow developers to match directly with online music services ( Spotify, Deezer, Youtube etc ) and standard codes such as ISRC and UPC. It enables clients to offer direct links to their users, allowing them to play or purchase tracks instantly in their respective music services.

Music Recognition Service enables your product ( apps or pc software ) to recognize music by sounds or files.
In this tutorial, we use ACRCloud Music bucket, if you want to recognize your own contents, please refer to Recognize Custom Content.

Refer this link https://docs.acrcloud.com/tutorials/recognize-music to setup account on ACRCloud for identify music.



Identify Music or TV with Android SDK:
This demo shows how to identify music ( songs ) or detect live TV channels by recorded sound with ACRCloud Android SDK.

Preparation:
This Android SDK contains the project developed with Android Studio IDE.
If you want to recognize music, you need a Audio Recognition project.
If you want to detect tv channels, you need a Live Channel Detection project.
Save the information of “host”, “access_key”, “access_secret” of your project.
Make sure you have setup the Android Development Environment well.

Register an account for free if you don’t have one on https://console.acrcloud.com/signup

Step 1
Download this Android SDK and unzip it.

Make sure you can find the folder named ACRCloudSDKDemo with AndroidManifest.xml in it.

Step 2
Open Android Studio, and select “Open an existing Android Studio project“, and find the folder named “ACRCloudSDKDemo“.

Step 3
Edit MainActivity.java, update “this.mConfig.host”, “this.mConfig.accessKey” and “this.mConfig.accessSecret” with the corresponding values of your project.

Step 4
Make sure you have an Android device connected to “Android Studio”, and run this project.

Now you can test recognizing contents in the buckets of your project. Press “start” to activate the audio recognition process.

What is Firebase?
Firebase is a cloud service provider. It is now under google and this service can replace your whole server side part of your application. In many tutorials we had used MySQL and PHP for our database. But if we will use Firebase we do not need any server side code or configuration. We can directly use firebase. Firebase comes with a bundle of many features.


Add Firebase to our Android project:

Go to firebase.google.com.
Click on Get Started for Free.
Now click on create a new project.
Give your app a name and click on create project.
Now you will see the Firebase Panel. You need to click on Android Icon here.
Now you will see a panel here you need to put the package name of your project. You can get the package name from AndroidManifest.xml file. Copy the package name and paste it here and then click on Add App.
When you click Add App, a file named google-services.json will be downloaded. You need to paste this file inside app directory of your project. See the below image for explanation.
Now sync your project with Gradle.

Enabling Email/Password Authentication:
Again go to your firebase panel.
On the left side menu you will see Auth, click on it.
Now click on Set Up Sign In Method.
Now click on Email/Password, enable it and press save.

You can also refer to https://firebase.google.com/docs/android/setup for adding firebase to our project.

