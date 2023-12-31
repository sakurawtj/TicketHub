import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
    private _client? : Stan; //undefined for now, will be defined later
    
    get client() {
        if(!this._client) {
            throw new Error('Cannot access NATS client before connecting');
        }
        return this._client;
    }
    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('connected to NATS');
                resolve();
            });
            this.client.on('error', (err) => {
                reject(err);
            })
        });

    }

}
// share the instance to all the files
// just like how mongoose works
export const natsWrapper =  new NatsWrapper();