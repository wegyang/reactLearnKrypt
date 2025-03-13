// index.jsx
import { Home } from '../pages/Home';
import MulTransfer from "../pages/MulTransfer.jsx";

const routes  = [
    { path: '/', element: <Home /> },
    { path: '/mulTransfer', element: <MulTransfer /> },
    // { path: '/ssss', element: <Ssss /> },
];

export default routes;