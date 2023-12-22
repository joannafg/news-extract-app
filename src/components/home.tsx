import React, { useState } from "react";
import '../index.css';
import { Input } from 'antd';
import { Button, Flex, Typography } from 'antd';
import { Card, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Link } = Typography;

const Home: React.FC = () => {

    const initialOpenAIResult = {
        role: '',
        content: ''
    };

    const [message, setMessage] = useState('');
    const [openaiResult, setOpenaiResult] = useState(initialOpenAIResult);

    const fetchMessage = async () => {
        try {
            const payload = {
                inputs: arr.map(item => item.value)
            };
            const response = await axios.post('https://pacific-stream-59101-283446563bde.herokuapp.com/submit', payload);
            // const response = await axios.post('http://localhost:3001/submit', payload);

            setOpenaiResult(response.data.openaiResult);
            setMessage(`Response: ${response.data.message}. Data received: ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.error('Error sending data: ', error);
            setMessage('Failed to send data');
        }
    };


    //https://stackoverflow.com/questions/66469913/how-to-add-input-field-dynamically-when-user-click-on-button-in-react-js

    const uid = function () {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    const inputArr: { id: number, type: string, value: string }[] = [
        {
            type: "text",
            id: uid(),
            value: ""
        }
    ];

    const [arr, setArr] = useState(inputArr);

    const addInput = () => {
        setArr(s => {
            // const lastId = s[s.length - 1].id;
            return [
                ...s,
                {
                    type: "text",
                    value: "",
                    id: uid()
                }
            ];
        });
        console.log(arr);
    };

    const deleteInput = (e: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
        e.preventDefault();

        setArr(s => {
            const newArr = s.slice();
            if (index > -1) {
                newArr.splice(index, 1);
            }

            return newArr;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        const index = Number(e.target.id);
        setArr(s => {
            const newArr = s.slice();
            newArr[index].value = e.target.value;

            return newArr;
        });
    };

    return (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            {arr.map((item, i) => {
                return (
                    <Space direction="horizontal" size="middle" style={{ display: 'flex' }}>
                        <Input
                            onChange={handleChange}
                            value={item.value}
                            id={i.toString()}
                            type={item.type}
                            size="middle"
                            style={{ width: 400 }}
                            placeholder="paste your link here"
                        />
                        <Button type="primary" icon={<DeleteOutlined />} onClick={(e) => deleteInput(e, i)} size={"middle"} />
                    </Space >
                );
            })}
            <Button type="primary" onClick={(e) => addInput()}>Add</Button>
            <Button type="primary" onClick={(e) => fetchMessage()}>Submit</Button>
            <Text>{message}</Text>
            <Text>{openaiResult.content}</Text>
        </Space >);
};

export default Home;