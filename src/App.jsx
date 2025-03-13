// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components';
import routes from './routes/index.jsx'; // 导入路由配置

const App = () => (
    <BrowserRouter>
        <div className="min-h-screen">
            <div className="gradient-bg-welcome">
                <Navbar /> {/* 顶部导航栏 */}
                <Routes>
                    {routes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                </Routes>
                {/*<Footer /> /!* 底部页脚 *!/*/}
            </div>
        </div>
    </BrowserRouter>
);

export default App;