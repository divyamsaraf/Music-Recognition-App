package com.acrcloud.acrclouduniversalsdkdemo;

import android.Manifest;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Environment;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.acrcloud.rec.ACRCloudClient;
import com.acrcloud.rec.ACRCloudConfig;
import com.acrcloud.rec.ACRCloudResult;
import com.acrcloud.rec.IACRCloudListener;
import com.acrcloud.rec.IACRCloudRadioMetadataListener;
import com.acrcloud.rec.utils.ACRCloudLogger;
import com.google.firebase.auth.FirebaseAuth;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity implements IACRCloudListener, IACRCloudRadioMetadataListener, View.OnClickListener{

    private final static String TAG = "MainActivity";
    private FirebaseAuth firebaseAuth;
    private Button buttonLogout_;
    private TextView mVolume, mResult, tv_time;

    private boolean mProcessing = false;
    private boolean mAutoRecognizing = false;
    private boolean initState = false;

    private MediaPlayer mediaPlayer = new MediaPlayer();
    private boolean isPlaying = false;

    private String path = "";

    private long startTime = 0;
    private long stopTime = 0;

    private final int PRINT_MSG = 1001;

    private ACRCloudConfig mConfig = null;
    private ACRCloudClient mClient = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        path = Environment.getExternalStorageDirectory().toString()
                + "/acrcloud";
        Log.e(TAG, path);

        File file = new File(path);
        if(!file.exists()) {
            file.mkdirs();
            //initializing firebase authentication object
            firebaseAuth = FirebaseAuth.getInstance();

            //if the user is not logged in
            //that means current user will return null
            if (firebaseAuth.getCurrentUser() == null) {
                //closing this activity
                finish();
                //starting login activity
                startActivity(new Intent(this, Main2Activity.class));
            }
        }
        buttonLogout_ = (Button) findViewById(R.id.buttonLogout1);
        //adding listener to button
        buttonLogout_.setOnClickListener(this);

        mVolume = (TextView) findViewById(R.id.volume);
        mResult = (TextView) findViewById(R.id.result);
        tv_time = (TextView) findViewById(R.id.time);

        findViewById(R.id.start).setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                start();
            }
        });

        findViewById(R.id.cancel).setOnClickListener(
                new View.OnClickListener() {

                    @Override
                    public void onClick(View v) {
                        cancel();
                    }
                });


        verifyPermissions();

        this.mConfig = new ACRCloudConfig();

        this.mConfig.acrcloudListener = this;
        this.mConfig.context = this;

        // Please create project in "http://console.acrcloud.cn/service/avr".
        this.mConfig.host = "xxxxxxx";
        this.mConfig.accessKey = "xxxxxxx";
        this.mConfig.accessSecret = "xxxxxxx";

        // auto recognize access key
        this.mConfig.hostAuto = "";
        this.mConfig.accessKeyAuto = "";
        this.mConfig.accessSecretAuto = "";

        this.mConfig.recorderConfig.rate = 8000;
        this.mConfig.recorderConfig.channels = 1;

        // If you do not need volume callback, you set it false.
        this.mConfig.recorderConfig.isVolumeCallback = true;

        this.mClient = new ACRCloudClient();
        ACRCloudLogger.setLog(true);

        this.initState = this.mClient.initWithConfig(this.mConfig);
    }

    public void start() {
        if (!this.initState) {
            Toast.makeText(this, "init error", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!mProcessing) {
            mProcessing = true;
            mVolume.setText("");
            mResult.setText("");


            if (this.mClient == null || !this.mClient.startRecognize()) {
                mProcessing = false;
                mResult.setText("start error!");
            }
            startTime = System.currentTimeMillis();
        }
    }

    public void cancel() {
        if (mProcessing && this.mClient != null) {
            this.mClient.cancel();
        }

        this.reset();
    }

    public void openAutoRecognize() {
        String str = this.getString(R.string.suss);
        if (!mAutoRecognizing) {
            mAutoRecognizing = true;
            if (this.mClient == null || !this.mClient.runAutoRecognize()) {
                mAutoRecognizing = true;
                str = this.getString(R.string.error);
            }
        }
        Toast.makeText(this, str, Toast.LENGTH_SHORT).show();
    }

    public void closeAutoRecognize() {
        String str = this.getString(R.string.suss);
        if (mAutoRecognizing) {
            mAutoRecognizing = false;
            this.mClient.cancelAutoRecognize();
            str = this.getString(R.string.error);
        }
        Toast.makeText(this, str, Toast.LENGTH_SHORT).show();
    }

    // callback IACRCloudRadioMetadataListener
    public void requestRadioMetadata() {
        String lat = "39.98";
        String lng = "116.29";
        List<String> freq = new ArrayList<>();
        freq.add("88.7");
        if (!this.mClient.requestRadioMetadataAsyn(lat, lng, freq,
                ACRCloudConfig.RadioType.FM, this)) {
            String str = this.getString(R.string.error);
            Toast.makeText(this, str, Toast.LENGTH_SHORT).show();
        }
    }

    public void reset() {
        tv_time.setText("");
        mResult.setText("");
//        songName.setText("");
        mProcessing = false;
    }
    TextView songName, Artist, Album1, Lyricists, Rdate, Composers;


    @Override
    public void onResult(ACRCloudResult results) {
        this.reset();

        // If you want to save the record audio data, you can refer to the following codes.
	/*
	byte[] recordPcm = results.getRecordDataPCM();
        if (recordPcm != null) {
            byte[] recordWav = ACRCloudUtils.pcm2Wav(recordPcm, this.mConfig.recorderConfig.rate, this.mConfig.recorderConfig.channels);
            ACRCloudUtils.createFileWithByte(recordWav, path + "/" + "record.wav");
        }
	*/

        String result = results.getResult();
        songName = findViewById(R.id.songName);
        Artist = findViewById(R.id.Artist);
        Album1 = findViewById(R.id.Album1);
        Lyricists = findViewById(R.id.Lyricists);
        Composers = findViewById(R.id.Composers);
        Rdate = findViewById(R.id.Rdate);

        String tres = "\n";

        try {
            JSONObject j = new JSONObject(result);
            JSONObject j1 = j.getJSONObject("status");
            int j2 = j1.getInt("code");
            if(j2 == 0){
                JSONObject metadata = j.getJSONObject("metadata");
                //
                if (metadata.has("music")) {
                    JSONArray musics = metadata.getJSONArray("music");
                    for(int i=0; i<musics.length(); i++) {
                        JSONObject tt = (JSONObject) musics.get(i);
                        // Title
                        String title = tt.getString("title");

                        // Artist
                        JSONArray _artist = tt.getJSONArray("artists");

                        String artist = new String("");
                        for(int l = 0; l<_artist.length(); ++l){
                            //artist += _artist.get(l).get("name") +"\n";
                            JSONObject temp = (JSONObject) _artist.get(l);
                            artist += temp.get("name") + "\n\t\t\t\t\t\t\t\t\t\t\t";
                        }
                        Artist.setText("Artist: " + artist);

                        // Album_Name
                        JSONObject _alb = (JSONObject) tt.get("album");
                        String albm = (String) _alb.get("name");
                        Album1.setText("Album: " + albm);

                        // Release Date
                        String rdate = tt.getString("release_date");

                        songName.setText("Title: " + title);
                        Rdate.setText("Album: " + rdate);

//                        // lyricists
                        JSONObject lyr = (JSONObject) tt.get("contributors");
                        JSONArray lyric = (JSONArray) lyr.get("lyricists");
                        String lyricists = new String("");
                        for (int l = 0; l< lyric.length(); ++l) lyricists += lyric.get(l) +"\n";
                        Lyricists.setText("Lyricists: " + lyricists);

                        // Composers
                        JSONObject _comp = (JSONObject) tt.get("contributors");
                        JSONArray comp1 = (JSONArray) lyr.get("composers");
                        String composers = new String("");
                        for (int l = 0; l< comp1.length(); ++l) composers += comp1.get(l) +"\n";
                        Composers.setText("Composers: " + composers);

                    }
                }
//                to show metadata use below line.
//                tres = tres + "\n\n" + result;
            }else{
                tres = "Sorry. Can't Recognise.... Try Again!";
            }
        } catch (JSONException e) {
//            tres = result;
            e.printStackTrace();
        }

        mResult.setText(tres);
        startTime = System.currentTimeMillis();
    }

    @Override
    public void onVolumeChanged(double volume) {
        long time = (System.currentTimeMillis() - startTime) / 1000;
        mVolume.setText(getResources().getString(R.string.volume) + volume + "\n\nTime: " + time + " s");
    }

    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS = {
            Manifest.permission.ACCESS_NETWORK_STATE,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.INTERNET,
            Manifest.permission.RECORD_AUDIO
    };
    public void verifyPermissions() {
        for (int i=0; i<PERMISSIONS.length; i++) {
            int permission = ActivityCompat.checkSelfPermission(this, PERMISSIONS[i]);
            if (permission != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, PERMISSIONS,
                        REQUEST_EXTERNAL_STORAGE);
                break;
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        Log.e("MainActivity", "release");
        if (this.mClient != null) {
            this.mClient.release();
            this.initState = false;
            this.mClient = null;
        }
    }

    @Override
    public void onRadioMetadataResult(String s) {
        mResult.setText(s);
    }

    @Override
    public void onClick(View v) {
        //if logout is pressed
        if (v == buttonLogout_) {
            //logging out the user
            firebaseAuth.signOut();
            //closing activity
            finish();
            //starting login activity
            startActivity(new Intent(this, Main2Activity.class));
        }
    }
}

