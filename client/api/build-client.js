import axios from 'axios';

export default({req}) => {
    if (typeof window === 'undefined') {
        // we are on the server
        // request should be made to ingress-nginx
        return axios.create({
            baseURL:'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            // pass the cookie data
            headers: req.headers
        });
    } else {
        // we are on the browser
        // request can be made to base url of ''
        return axios.create({
            baseURL:'/'
        });
    }
}