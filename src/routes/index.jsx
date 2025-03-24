// index.jsx
import { Home } from '../pages/Home';
import MulTransfer from "../pages/MulTransfer.jsx";
import {QuestionCircleOutlined} from "@ant-design/icons";
import Bundle from "../pages/BundleTransfer2.jsx";

const routes  = [
    { path: '/', element: <Home /> },
    { path: '/mulTransfer', element: <MulTransfer /> },
    { path: '/bundle', element: <Bundle /> },
    // { path: '/ssss', element: <Ssss /> },
];

export default routes;