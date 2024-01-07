import React, { useState } from "react";
import '../index.css';
import { Input } from 'antd';
import { Button, Flex, Typography } from 'antd';
import { Card, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, VerticalAlign } from "docx";


const { Text, Link } = Typography;

const Home: React.FC = () => {

    const initialOpenAIResult = {
        date: "x",
        mediaName: "x",
        title: "x",
        articleSummary: "x",
        mediaBackgroundSummary: "x"
    };

    const [message, setMessage] = useState('x');
    const [openaiResult, setOpenaiResult] = useState(initialOpenAIResult);
    const [isDataFetched, setIsDataFetched] = useState(false);


    const fetchMessage = async () => {
        try {
            const payload = {
                inputs: arr.map(item => item.value)
            };
            const response = await axios.post('https://pacific-stream-59101-283446563bde.herokuapp.com/submit', payload);
            // const response = await axios.post('http://localhost:3001/submit', payload);

            setOpenaiResult(response.data.parsedData);
            setMessage(`Response: ${response.data.message}. Data received: ${JSON.stringify(response.data)}`);
            setIsDataFetched(true);
        } catch (error) {
            console.error('Error sending data: ', error);
            setMessage('Failed to send data');
            setIsDataFetched(false);
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

    const createAndDownloadDoc = () => {
        const doc = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: "defaultParagraph",
                        name: "Default Paragraph",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            size: 24,
                        },
                    },
                ],
            },
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Table 1: Published Materials regarding XXX and his or her distinguished work/experience", bold: true }),
                        ],
                    }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph("Date")],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [
                                                new TextRun({ text: "Media/Publication", bold: true }),
                                            ],
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph("Title")],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph(openaiResult.date)],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [
                                                new TextRun({ text: openaiResult.mediaName, bold: true }),
                                            ],
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(openaiResult.title)],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            // Download the document
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "Summary.docx";
            anchor.click();

            window.URL.revokeObjectURL(url);
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
            <h1>------</h1>
            <Text>date: {openaiResult.date}</Text>
            <Text>mediaName: {openaiResult.mediaName}</Text>
            <Text>title: {openaiResult.title}</Text>
            <Text>articleSummary: {openaiResult.articleSummary}</Text>
            <Text>mediaBackgroundSummary: {openaiResult.mediaBackgroundSummary}</Text>
            {isDataFetched && (
                <>
                    <Button type="primary" onClick={createAndDownloadDoc}>Download Word Document</Button>
                    <div style={{ height: '20px' }} />
                </>
            )}
        </Space >);
};

export default Home;