import Link from "next/link"
// import buildClient from '../api/build-client';


// file name index.js means it is the root
const LandingPage = ({currentUser, tickets}) => {
    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        View
                    </Link>
                </td>
            </tr>
        )
    })
    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
}

/* 
 fetch data for rendering
 executed in the server when hard refresh/ click link from different domain/ type the url
 executed in the client side when navigating from one page to another while in the app
*/
LandingPage.getInitialProps = async (context, client, currentUser) => {
    /*
     go to the localhost inside the container to fetch the data, which will cause error
     const response = await axios.get('/api/users/currentuser');
     it is an object like 'currentUser : null'
    */ 
    // const { data } = await buildClient(context).get('/api/users/currentuser');
    // return data;
    const {data} = await client.get('/api/tickets');
    return {tickets: data}
};
export default LandingPage;