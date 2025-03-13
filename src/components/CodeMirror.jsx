import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror from '@uiw/react-codemirror';
import  {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons'
import  {useState, useEffect} from "react";


const myTheme = createTheme({
    theme: 'light',
    settings: {
        background: '#ffffff',
        backgroundImage: '',
        foreground: '#454545',
        caret: '#395129',
        selection: '#e0c9fd',
        selectionMatch: '#bfbfbf',
        gutterBackground: '#ffffff',
        gutterForeground: '#4D4D4C',
        gutterBorder: '#ffffff',
        gutterActiveForeground: '',
        lineHighlight: '#ffffff',
    },
})

// 没有了类型定义，直接使用默认值解构
const MyCodeMirror = ({ value, onChange }) => {
    const [isShowEye, setIsShowEye] = useState(true); // 控制是否显示明文
    const [maskedValue, setMaskedValue] = useState(''); // 加密后的内容

    // 根据 isShowEye 切换显示内容
    useEffect(() => {
        if (isShowEye) {
            // 显示明文
            setMaskedValue(value);
        } else {
            // 显示密文（用 * 替换所有字符）
            setMaskedValue(value.replace(/./g, '*'));
        }
    }, [isShowEye, value]);

    // 处理眼睛图标点击事件
    const handleEyeClick = () => {
        setIsShowEye(!isShowEye);
    };


    return (
      <div  style={{ position: 'relative' }}>
        <CodeMirror
            style={{border:"0.2px solid gray",borderRadius:"4px"}}
            value={isShowEye ? value : maskedValue}
            height="180px"
            width="420px"
            theme={myTheme}
            onChange={isShowEye ? onChange : undefined}
        />
      <div className="eyeBox" onClick={handleEyeClick}> {isShowEye ? (<EyeOutlined />) : <EyeInvisibleOutlined />} </div>
      </div>
  );
}

export default MyCodeMirror;