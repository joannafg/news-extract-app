import React, { useState } from "react";
import '../index.css';
import { Input } from 'antd';
import { Button, Flex, Typography } from 'antd';
import { Card, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, VerticalAlign } from "docx";


const { Text, Link } = Typography;

interface IOpenAIResult {
    date: string;
    mediaName: string;
    title: string;
    articleSummary: string;
    mediaBackgroundSummary: string;
}


const Home: React.FC = () => {

    const initialOpenAIResult = {
        date: "",
        mediaName: "",
        title: "",
        articleSummary: "",
        mediaBackgroundSummary: ""
    };

    const [messages, setMessages] = useState<string[]>([]);
    const [openaiResult, setOpenaiResult] = useState<IOpenAIResult[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);

    const updateMessage = (index: number, newMessage: string) => {
        setMessages(currentMessages => {
            const updatedMessages = [...currentMessages];
            updatedMessages[index] = newMessage;
            return updatedMessages;
        });
    };

    const updateOpenAIResult = (index: number, result: IOpenAIResult) => {
        setOpenaiResult(currentResults => {
            // If the index is greater than the current array length, fill the array
            const updatedResults = currentResults.length > index
                ? [...currentResults]
                : [...currentResults, ...Array(index - currentResults.length).fill(null)];

            updatedResults[index] = result;
            return updatedResults;
        });
    };

    const fetchMessages = async () => {
        setMessages([]);
        setOpenaiResult([]);
        arr.forEach(async (item, index) => {
            try {
                const payload = { inputs: [arr[index].value] };
                const response = await axios.post('https://pacific-stream-59101-283446563bde.herokuapp.com/submit', payload);
                // const response = await axios.post('http://localhost:3001/submit', payload);

                updateOpenAIResult(index, response.data.parsedData);
                updateMessage(index, `Response: ${response.data.message}. Data received: ${JSON.stringify(response.data)}`);
                setIsDataFetched(true);
                console.log(response.data);
            } catch (error) {
                console.error('Error sending data: ', error);
                updateOpenAIResult(index, { date: "", mediaName: "", title: "", articleSummary: "", mediaBackgroundSummary: "" });
                updateMessage(index, 'Failed to send data');
                setIsDataFetched(false);
                console.log(error);
            }
        });
    };


    //https://stackoverflow.com/questions/66469913/how-to-add-input-field-dynamically-when-user-click-on-button-in-react-js

    const uid = function () {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

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
                default: {
                    document: {
                        run: {
                            size: 24, // Size 12 in half-points
                            font: "Times New Roman",
                        },
                        paragraph: {
                            spacing: {
                                line: 276, // Line spacing (1.15 * 240)
                            },
                        },
                    },
                },
            },
            sections: [{
                properties: {},
                children: [
                    new Paragraph(''),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Table 1: Published Materials regarding XXX and his or her distinguished work/experience", bold: true }),
                        ],
                        alignment: 'center',
                    }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: "Date",
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [
                                                new TextRun({ text: "Media/Publication", bold: true }),
                                            ],
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: "Title",
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: openaiResult.date,
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [
                                                new TextRun({ text: openaiResult.mediaName, bold: true }),
                                            ],
                                            alignment: 'center',
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
                    new Paragraph(''),

                    // MediaName, Title, and Date
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `1.1 ${openaiResult.mediaName}: ${openaiResult.title} (Dated on ${openaiResult.date})`,
                                bold: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Article Summary with left indent
                    new Paragraph({
                        text: openaiResult.articleSummary,
                        indent: { firstLine: 720 }, // Indentation (value in twentieths of a point)
                    }),

                    // Empty line
                    new Paragraph(''),

                    // About MediaName in bold and italic
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `About ${openaiResult.mediaName}`,
                                bold: true,
                                italics: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Media Background Summary with left indent
                    new Paragraph({
                        text: openaiResult.mediaBackgroundSummary,
                        indent: { firstLine: 720 }, // Indentation
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


    const createAndDownloadDoc = () => {
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            size: 24, // Size 12 in half-points
                            font: "Times New Roman",
                        },
                        paragraph: {
                            spacing: {
                                line: 276, // Line spacing (1.15 * 240)
                            },
                        },
                    },
                },
            },
            sections: [{
                properties: {},
                children: [
                    new Paragraph(''),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Table 1: Published Materials regarding XXX and his or her distinguished work/experience", bold: true }),
                        ],
                        alignment: 'center',
                    }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: "Date",
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [
                                                new TextRun({ text: "Media/Publication", bold: true }),
                                            ],
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: "Title",
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: openaiResult.date,
                                            alignment: 'center',
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [
                                                new TextRun({ text: openaiResult.mediaName, bold: true }),
                                            ],
                                            alignment: 'center',
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
                    new Paragraph(''),

                    // MediaName, Title, and Date
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `1.1 ${openaiResult.mediaName}: ${openaiResult.title} (Dated on ${openaiResult.date})`,
                                bold: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Article Summary with left indent
                    new Paragraph({
                        text: openaiResult.articleSummary,
                        indent: { firstLine: 720 }, // Indentation (value in twentieths of a point)
                    }),

                    // Empty line
                    new Paragraph(''),

                    // About MediaName in bold and italic
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `About ${openaiResult.mediaName}`,
                                bold: true,
                                italics: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Media Background Summary with left indent
                    new Paragraph({
                        text: openaiResult.mediaBackgroundSummary,
                        indent: { firstLine: 720 }, // Indentation
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
            <Text type="secondary">Please include the full web address. exp. https://... <br></br> After submit is clicked, please wait up to 30 seconds for it to process. In the meantime, do not refresh the page or click submit again.</Text>
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
            <Button type="primary" size={"middle"} onClick={(e) => addInput()}>Add</Button>
            <Button type="primary" size={"middle"} onClick={(e) => fetchMessages()}>Submit</Button>
            {!isDataFetched && (
                <Text type="danger">{messages}</Text>
            )}
            {isDataFetched && openaiResult.map((item, index) => (
                item && item.date && item.mediaName && item.title ? (
                    <>
                        <div
                            style={{
                                color: '#889900',
                                backgroundColor: '#889900',
                                borderColor: '#889900',
                                height: 1,
                                width: 600,
                            }}
                        />
                        <Text type="secondary">
                            This news article publication date is {item.date}.
                            Name of the media is {item.mediaName}.
                            Title of the news article is {item.title}.
                            <br></br>
                            Here is a summary of news article: {item.articleSummary}
                            <br></br>
                            Here is a summary on the background of the media: {item.mediaBackgroundSummary}
                        </Text>
                        {/* <Text type="secondary">Name of the media is: {openaiResult.mediaName}</Text>
                    <Text type="secondary">Title of the news article is: {openaiResult.title}</Text>
                    <Text type="secondary">Here is a summary of news article: {openaiResult.articleSummary}</Text>
                    <Text type="secondary">Here is a summary on the background of the media: {openaiResult.mediaBackgroundSummary}</Text> */}
                        <Button type="primary" onClick={createAndDownloadDoc}>Download Result as A Word Document</Button>
                        <div style={{ height: '20px' }} />
                    </>
                ) : (
                    <Text type="danger">Error: Data for item {index} is incomplete.</Text>
                )
            ))}
        </Space >);
};

export default Home;