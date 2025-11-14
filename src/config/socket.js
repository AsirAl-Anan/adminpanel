import {io} from 'socket.io-client';


const socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials:true,
    
});
console.log(socket)
console.log(import.meta.env.VITE_SOCKET_URL
    
)
socket.connect();
export default socket
