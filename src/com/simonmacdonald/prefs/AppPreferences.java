package com.simonmacdonald.prefs;

import java.util.Iterator;
import java.util.Map;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.preference.PreferenceManager;

public class AppPreferences extends CordovaPlugin {

    private static final String LOG_TAG = "AppPrefs";
    private static final int NO_PROPERTY = 0;
    private static final int NO_PREFERENCE_ACTIVITY = 1;

    private static final int SHOW_PREFERENCEACTIVITY_INTENT = 1;
    private CallbackContext auxCtx;

    @Override
    public boolean execute(String action, JSONArray args,
	    CallbackContext callbackContext) {
	PluginResult.Status status = PluginResult.Status.OK;
	String result = "";

	SharedPreferences sharedPrefs = PreferenceManager
		.getDefaultSharedPreferences(this.cordova.getActivity());

	try {
	    if (action.equals("get")) {
		String key = args.getString(0);
		if (sharedPrefs.contains(key)) {
		    Object obj = sharedPrefs.getAll().get(key);
		    callbackContext.sendPluginResult(new PluginResult(status,
			    obj.toString()));
		} else {
		    callbackContext.sendPluginResult(this.createErrorObj(
			    NO_PROPERTY, "No such property called " + key));
		}
	    } else if (action.equals("set")) {
		String key = args.getString(0);
		String value = args.getString(1);
		Editor editor = sharedPrefs.edit();
		if ("true".equals(value.toLowerCase())
			|| "false".equals(value.toLowerCase())) {
		    editor.putBoolean(key, Boolean.parseBoolean(value));
		} else {
		    editor.putString(key, value);
		}
		callbackContext.sendPluginResult(new PluginResult(status,
			editor.commit()));
	    } else if (action.equals("load")) {

		this.load(callbackContext);

	    } else if (action.equals("show")) {
		this.auxCtx = callbackContext;
		String activityName = args.getString(0);

		this.show(activityName, callbackContext);

	    } else if (action.equals("clear")) {
		Editor editor = sharedPrefs.edit();
		editor.clear();
		callbackContext.sendPluginResult(new PluginResult(status,
			editor.commit()));
	    } else if (action.equals("remove")) {
		String key = args.getString(0);
		if (sharedPrefs.contains(key)) {
		    Editor editor = sharedPrefs.edit();
		    editor.remove(key);
		    editor.commit();
		    callbackContext.sendPluginResult(new PluginResult(status,
			    editor.commit()));
		} else {
		    callbackContext.sendPluginResult(this.createErrorObj(
			    NO_PROPERTY, "No such property called " + key));
		}
	    }
	    return true;
	} catch (JSONException e) {
	    status = PluginResult.Status.JSON_EXCEPTION;
	}
	callbackContext.sendPluginResult(new PluginResult(status, result));
	return false;
    }

    private void load(CallbackContext callbackContext) {

	SharedPreferences sharedPrefs = PreferenceManager
		.getDefaultSharedPreferences(this.cordova.getActivity());
	Map map = sharedPrefs.getAll();
	Iterator entries = map.entrySet().iterator();
	JSONObject response = new JSONObject();
	while (entries.hasNext()) {
	    Map.Entry entry = (Map.Entry) entries.next();
	    String key = (String) entry.getKey();
	    String value = (String) entry.getValue();

	    try {
		response.put(key, value);
	    } catch (JSONException e) {
		continue;
	    }
	}
	callbackContext.sendPluginResult(new PluginResult(
		PluginResult.Status.OK, response));
    }

    private void show(String prefActivity, CallbackContext callbackContext) {

	String activityClass = prefActivity;
	this.auxCtx = callbackContext;

	try {
	    Class a = Class.forName(activityClass);

	    Intent intent = new Intent(this.cordova.getActivity(), a);
	    intent.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);

	    this.cordova.startActivityForResult(this, intent,
		    SHOW_PREFERENCEACTIVITY_INTENT);

	} catch (ClassNotFoundException e) {
	    callbackContext.sendPluginResult(new PluginResult(
		    PluginResult.Status.ERROR,
		    "No preferences activity called " + prefActivity));
	}

    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {

	if (requestCode == SHOW_PREFERENCEACTIVITY_INTENT) {
	    this.load(this.auxCtx);
	}
    }

    private PluginResult createErrorObj(int code, String message)
	    throws JSONException {
	JSONObject errorObj = new JSONObject();
	errorObj.put("code", code);
	errorObj.put("message", message);
	return new PluginResult(PluginResult.Status.ERROR, errorObj);
    }

}