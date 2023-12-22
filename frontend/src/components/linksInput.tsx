import React from 'react';
import '../index.css'
import { Input } from 'antd';

const LinksInput: React.FC = () => (
    <div>
        <Input addonAfter="test" defaultValue="mysite" />
    </div>);

export default LinksInput;