class Machine{
    constructor(
        runAuto,
        jogStop,
        alarm,
        moldLocked,
    ){
        this.time = Date.now().valueOf();
        this.runAuto = runAuto;
        this.jogStop = jogStop;
        this.alarm = alarm;
        this.moldLocked = moldLocked;
    }

    withNewState(runState, alarm, lock) {
        const states = {
            "run": [1, 0],
            "stop": [0, 0],
            "jogStop": [0,1]
        };
        const [runAuto, jogStop] = states[runState];
        return new Machine(
            this.name,
            runAuto,
            jogStop,
            alarm,
            lock
        );
    }
}

class plcSimulator {
    constructor() {
        this.machines = [
            newMachine(),
            newMachine(),
            newMachine(),
            newMachine(),
        ]
    }

    tick(machine){
        if(machine.alarm === false) {
            const running = !machine.moldLocked
            machine.moldLocked = running
            machine.runAuto = running
            machine.jogStop = !running
        }else{
            machine.moldLocked = 0;
            machine.runAuto = 0; 
            machine.jogStop = 0;
        }
    }

    start(client){
        this.machines.forEach((m, i) => {
            setInterval(() => {
                this.tick(m)
                const dataMsg = this.stringToSend();
                const doneMsg = {"timestamp": Date.now().valueOf(),"plc":"oplc-01","info":"done"}
                   
                console.log(dataMsg);
                console.log(doneMsg);
                client.publish("machinedata", dataMsg);
                client.publish("machinedata", doneMsg);
            },
        1500 * (i+1));
        })
    }

    stringToSend(){
        const ios = new Array(16).fill(0);
        this.machines.forEach((x,i) => {
            ios[0+(i*4)] = + x.jogStop;
            ios[1+(i*4)] = + x.runAuto;
            ios[2+(i*4)] = + x.alarm;
            ios[3+(i*4)] = + x.moldLocked;
        });
        const plc_message = {
            "timestamp": Date.now().valueOf(),
            "plc": "oplc-1",
            "type": "16NE3",
            "io": ios
        }
        return JSON.stringify(plc_message);
    }

    setAlarm(machineNumber) {
        this.machines[machineNumber].alarm = true;
    }

    clearAlarm(machineNumber) {
        this.machines[machineNumber].alarm = false;
    }
}

function newMachine() {
   return new Machine(
        false,
        false,
        false,
        false,
    );
}

module.exports = {plcSimulator}
