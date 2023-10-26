import buildClient from '../api/build-client';

// file name index.js means it is the root
const LandingPage = ({currentUser}) => {
    return currentUser ? <h1>You are signed in</h1> : <h1>You are not signed in</h1>
}

/* 
 fetch data for rendering
 executed in the server when hard refresh/ click link from different domain/ type the url
 executed in the client side when navigating from one page to another while in the app
*/
LandingPage.getInitialProps = async (context) => {
    /*
     go to the localhost inside the container to fetch the data, which will cause error
     const response = await axios.get('/api/users/currentuser');
     it is an object like 'currentUser : null'
    */ 
    const { data } = await buildClient(context).get('/api/users/currentuser');
    return data;
};
export default LandingPage;