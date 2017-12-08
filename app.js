'use strict';

const Homey = require('homey');
const { HomeyAPI  } = require('athom-api')

// Flow triggers
let triggerAlarmActivated = new Homey.FlowCardTrigger('Alarm_Activated');

// Flow conditions
const conditionSurveillanceActivated = new Homey.FlowCardCondition('SurveillanceActivated');
 
// Flow actions
const actionInputLog = new Homey.FlowCardAction('Send_Info');
const actionClearLog = new Homey.FlowCardAction('Clear_Log');
const actionActivateSurveillance = new Homey.FlowCardAction('Activate_Surveillance');
const actionDeactivateSurveillance = new Homey.FlowCardAction('Deactivate_Surveillance');
const actionActivateAlarm = new Homey.FlowCardAction('Activate_Alarm');
const actionDeactivateAlarm = new Homey.FlowCardAction('Deactivate_Alarm');



const _ = require('lodash');

var surveillance = true;
var alarm = false;
var allDevices

class heimdallClass extends Homey.App {
    // Get API control function
    getApi() {
        if (!this.api) {
        this.api = HomeyAPI.forCurrentHomey();
        }
        return this.api;
    }

    // Get all devices function
    async getDevices() {
        const api = await this.getApi();
        allDevices = await api.devices.getDevices();
        return allDevices;
    }

    // Start server function
    async startingServer() {
        
            // Get the homey object
            const api = await this.getApi();
            // Subscribe to realtime events and set all devices global
            await api.devices.subscribe();
            api.devices.on('device.create', async(id) => {
            await console.log('New device found!')
            const device = await api.devices.getDevice({
                id: id
            })
            await this.addDevice(device);
            });
            allDevices = await api.devices.getDevices();

            // Loop devices
            _.forEach(allDevices, (device) => {
                this.addDevice(device, api);
            });
    }
    
	onInit() {
        this.startingServer();
		this.log('init heimdallClass')
    }

    // Add device function, only motion- and contact sensors are added
    addDevice(device, api) {
        if (device.class === 'sensor' && 'alarm_motion' in device.capabilities) {
            console.log('Found motion sensor: ' + ' - ' + device.name)
            attachEventListner(device,'motion')
        } 
        else if (device.class === 'sensor' && 'alarm_contact' in device.capabilities) {
            console.log('Found contact sensor: ' + ' - ' + device.name)
            attachEventListner(device,'contact')
            }
        else {
            //console.log('No matching class found for: ' + ' - ' + device.name)
        }
    }

}
module.exports = heimdallClass;

surveillance = Homey.ManagerSettings.get('surveillanceStatus'); 
console.log('surveillance: ' + surveillance);
if ( surveillance == null ) {
    surveillance = true
}

// Flow triggers functions
triggerAlarmActivated
    .register()
    .on('run', ( args, state, callback ) => {
        console.log(args)
        if ( true ) {
            callback( null, true );
        }   
        else {
            callback( null, false );
        } 
    });

//Flow condition functions
conditionSurveillanceActivated
    .register()
    .on('run', ( args, state, callback ) => {
        if (Homey.ManagerSettings.get('surveillanceStatus')) {
            callback( null, true )
        }
        else {
            callback( null, false )
        }
    });

//Flow actions functions
actionInputLog.register().on('run', ( args, state, callback ) => {
    let nu = getDateTime();
    surveillance = Homey.ManagerSettings.get('surveillanceStatus');
    let logNew = nu + surveillance + " || Flowcard || " + args.log;
    console.log('Logging: ' + logNew);
    const logOld = Homey.ManagerSettings.get('myLog');
    if (logOld != undefined) { 
        logNew = logNew+"\n" + logOld;
    }
    Homey.ManagerSettings.set('myLog', logNew );
    callback( null, true );
});

actionClearLog.register().on('run', ( args, state, callback ) => {
    Homey.ManagerSettings.set('myLog', '' );
    console.log (' Action.Clear_log: The log data is cleared.');
    callback( null, true );
}); 

actionActivateSurveillance.register().on('run', ( args, state, callback ) => {
    let nu = getDateTime();
    let surveillance = true;
    Homey.ManagerSettings.set('surveillanceStatus', surveillance, function( err ){
        if( err ) return Homey.alert( err );
    });
    let logNew = nu + surveillance + " || Flowcard || Surveillance mode is activated.";
    console.log('Logging: ' + logNew);
    const logOld = Homey.ManagerSettings.get('myLog');
    if (logOld != undefined) { 
        logNew = logNew+"\n" + logOld;
    }
    Homey.ManagerSettings.set('myLog', logNew );
    callback( null,true ); 
});

actionDeactivateSurveillance.register().on('run', ( args, state, callback ) => {
    let nu = getDateTime();
    let surveillance = false;
    Homey.ManagerSettings.set('surveillanceStatus', surveillance, function( err ){
        if( err ) return Homey.alert( err );
    });
    let logNew = nu + surveillance + " || Flowcard || Surveillance mode is deactivated.";
    console.log('Logging: ' + logNew);
    const logOld = Homey.ManagerSettings.get('myLog');
    if (logOld != undefined) { 
        logNew = logNew+"\n" + logOld;
    }
    Homey.ManagerSettings.set('myLog', logNew );
    callback( null,true );
});

actionActivateAlarm.register().on('run', ( args, state, callback ) => {
    let nu = getDateTime();
    let Alarm = true;
    surveillance = Homey.ManagerSettings.get('surveillanceStatus');
    Homey.ManagerSettings.set('alarmStatus', Alarm, function( err ){
        if( err ) return Homey.alert( err );
    });
    let logNew = nu + surveillance + " || Flowcard || Alarm is activated.";
    console.log('Logging: ' + logNew);
    const logOld = Homey.ManagerSettings.get('myLog');
    if (logOld != undefined) { 
        logNew = logNew+"\n" + logOld;
    }
    Homey.ManagerSettings.set('myLog', logNew );
    callback( null,true ); 
});

actionDeactivateAlarm.register().on('run', ( args, state, callback ) => {
    let nu = getDateTime();
    let Alarm = false;
    surveillance = Homey.ManagerSettings.get('surveillanceStatus');
    Homey.ManagerSettings.set('alarmStatus', Alarm, function( err ){
        if( err ) return Homey.alert( err );
    });
    let logNew = nu + surveillance + " || Flowcard || Alarm is deactivated.";
    console.log('Logging: ' + logNew);
    const logOld = Homey.ManagerSettings.get('myLog');
    if (logOld != undefined) { 
        logNew = logNew+"\n" + logOld;
    }
    Homey.ManagerSettings.set('myLog', logNew );
    callback( null,true );
});

// this function attaches en eventlistner to a device
function attachEventListner(device,sensorType) {
    if(device.name.includes('[H]')) {
        device.on('$state', _.debounce(state => { 
            stateChange(device,state,sensorType)
        }));
        console.log('Attached Eventlistner: ' + ' - ' + device.name)
    }
}

// this function gets called when a device with an attached eventlistner fires an event.
function stateChange(device,state,sensorType) {
    let nu = getDateTime();
    let sensorState;
    surveillance = Homey.ManagerSettings.get('surveillanceStatus');
    if (sensorType == 'motion') {
        sensorState = state.alarm_motion
    } else if (sensorType == 'contact') {
        sensorState = state.alarm_contact
    };
    let logNew = nu + surveillance + " || Heimdall || " + device.name + ": " + sensorState;
    if (surveillance == true && sensorState == true) {
        alarm=true;
        logNew = nu + surveillance + " || Heimdall || Alarm is activated: " + device.name + ": " + sensorState;
        Homey.ManagerSettings.set('alarmStatus', alarm, function( err ){
            if( err ) return Homey.alert( err );
        });
        //alarm
        var tokens= {'Reason': device.name + ': '+ sensorState };
        triggerAlarmActivated.trigger(tokens, state, function(err, result){
            if( err ) {
                return Homey.error(err)} ;
            } )

    }
    console.log('Logging: ' + logNew);
    const logOld = Homey.ManagerSettings.get('myLog');
    if (logOld != undefined) { 
        logNew = logNew+"\n"+logOld;
    }
    Homey.ManagerSettings.set('myLog', logNew );
}

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var msec = ("00" + date.getMilliseconds()).slice(-3)

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "-" + month + "-" + year + "  ||  " + hour + ":" + min + ":" + sec + "." + msec + "  ||  ";
}

