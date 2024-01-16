import React, { useState } from "react";
import '../index.css';
import { Input } from 'antd';
import { Button, Flex, Typography } from 'antd';
import { Card, Space } from 'antd';
import { Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, VerticalAlign } from "docx";


const { Text, Link } = Typography;
const { TextArea } = Input;


interface IOpenAIResult {
    date: string;
    mediaName: string;
    title: string;
    articleSummary: string;
    mediaBackgroundSummary: string;
}


const Home: React.FC = () => {

    const uid = function () {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    const inputArr: { id: number, type: string, value: string }[] = [
        {
            type: "link",
            id: uid(),
            value: ""
        }
    ];

    const [messages, setMessages] = useState<string[]>([]);
    const [openaiResult, setOpenaiResult] = useState<IOpenAIResult[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [arr, setArr] = useState(inputArr);


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

    function handleAxiosError(error: unknown, index: number, retries: number, maxRetries: number) {
        console.error('Error sending data: ', error);
        let errorMessage = "Server Error: Unknown";

        if (axios.isAxiosError(error)) {
            errorMessage = error.message;
            if (error.response) {
                errorMessage += " " + error.response.data;
            } else if (error.request) {
                errorMessage += " No response received";
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        if (retries < maxRetries) {
            retries++;
        } else {
            updateOpenAIResult(index, { date: errorMessage, mediaName: errorMessage, title: errorMessage, articleSummary: errorMessage, mediaBackgroundSummary: errorMessage });
            updateMessage(index, errorMessage);
        }
    }

    function isValidUrl(str: string) {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    }

    const fetchMessages = async () => {
        console.log(arr);
        setMessages([]);
        setOpenaiResult([]);
        setIsLoading(true);
        setIsDataFetched(true);
        const maxRetries = 2; // Set your desired retry limit

        for (let index = 0; index < arr.length; index++) {
            let retries = 0;
            const input = arr[index].value.trim();
            const isLink = arr[index].type === "link";
            const isValidInput = input.length > 0 && (!isLink || isValidUrl(input));

            while (retries <= maxRetries && isValidInput) {
                try {
                    const payload = { inputs: [input] };
                    const response = await axios.post('https://news-extract-app-fly.fly.dev/submit', payload);

                    const isEmptyString = Object.values(response.data.parsedData).some(value => value === "");
                    if (isEmptyString && retries < maxRetries) {
                        retries++;
                        continue;
                    } // TODO: debug. the loop is runnning even if the result is valid. also when they're multiple links input, it doesn't stop loading. 
                    updateOpenAIResult(index, response.data.parsedData);
                    updateMessage(index, `Response: ${response.data.message}. Data received: ${JSON.stringify(response.data)}`);
                    console.log(response);
                } catch (error) {
                    handleAxiosError(error, index, retries, maxRetries);
                    console.log(error);
                }
            }

            if (!isValidInput) {
                const errorMessage = isLink ? "The link provided is not valid, please input a valid link" : "It is empty, please input a link or paste the article";
                updateOpenAIResult(index, { date: errorMessage, mediaName: errorMessage, title: errorMessage, articleSummary: errorMessage, mediaBackgroundSummary: errorMessage });
                updateMessage(index, errorMessage);
            }

            if (index === arr.length - 1) { setIsLoading(false); }
        };
    };


    //https://stackoverflow.com/questions/66469913/how-to-add-input-field-dynamically-when-user-click-on-button-in-react-js

    const addInput = () => {
        setArr(s => [...s, { type: "link", value: "", id: uid() }]);
    };

    const addTextArea = () => {
        setArr(s => [...s, { type: "article", value: "", id: uid() }]);
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

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     e.preventDefault();

    //     const index = Number(e.target.id);
    //     setArr(s => {
    //         const newArr = s.slice();
    //         newArr[index].value = e.target.value;

    //         return newArr;
    //     });
    // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        const newArr = [...arr];
        newArr[index].value = e.target.value;
        setArr(newArr);
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
                            ...openaiResult.map(result => {
                                return new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({
                                                text: result.date,
                                                alignment: 'center',
                                            })],
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({
                                                children: [
                                                    new TextRun({ text: result.mediaName, bold: true }),
                                                ],
                                                alignment: 'center',
                                            })],
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                        new TableCell({
                                            children: [new Paragraph(result.title)],
                                        }),
                                    ],
                                });
                            })

                        ],
                    }),
                    ...openaiResult.flatMap((result, index) => [
                        new Paragraph(''),

                        // MediaName, Title, and Date
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `1.${index + 1} ${result.mediaName}: ${result.title} (Dated on ${result.date})`,
                                    bold: true,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),

                        // Article Summary with left indent
                        new Paragraph({
                            text: result.articleSummary,
                            indent: { firstLine: 720 }, // Indentation (value in twentieths of a point)
                        }),

                        // Empty line
                        new Paragraph(''),

                        // About MediaName in bold and italic
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `About ${result.mediaName}`,
                                    bold: true,
                                    italics: true,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),

                        // Media Background Summary with left indent
                        new Paragraph({
                            text: result.mediaBackgroundSummary,
                            indent: { firstLine: 720 }, // Indentation
                        }),])

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
            <Text type="secondary">Please include the full web address. exp. https://...</Text>
            {arr.map((item, i) => {
                return (
                    <Space direction="horizontal" size="middle" style={{ display: 'flex' }}>
                        {item.type === "link" ? (
                            <Input
                                onChange={(e) => handleChange(e, i)}
                                value={item.value}
                                id={i.toString()}
                                size="middle"
                                style={{ width: 400 }}
                                placeholder="Paste your link here"
                            />
                        ) : (
                            <TextArea
                                onChange={(e) => handleChange(e, i)}
                                value={item.value}
                                id={i.toString()}
                                size="middle"
                                style={{ width: 400 }}
                                placeholder="Paste your article here"
                                maxLength={3000}
                                autoSize={{ minRows: 3, maxRows: 6 }}
                            />
                        )}
                        <Button type="primary" icon={<DeleteOutlined />} onClick={(e) => deleteInput(e, i)} size={"middle"} />
                    </Space >
                );
            })}
            <Button type="primary" size={"middle"} onClick={(e) => addInput()}>Add New Link</Button>
            <Button type="primary" size={"middle"} onClick={addTextArea}>Add New Article</Button>
            <Button type="primary" size={"middle"} onClick={(e) => fetchMessages()}>Submit</Button>
            {isLoading && <Spin size="large" />}
            {isDataFetched && openaiResult.map((item, index) => (
                <>
                    {index === 0 && (
                        <div
                            style={{
                                borderColor: '#889900',
                                borderStyle: 'dotted',
                                borderWidth: '1px',
                                width: 600,
                                height: 'auto',
                            }}
                        />
                    )}
                    {item && item.date && item.mediaName && item.title ? (
                        <>
                            <Text type="secondary">
                                Article <strong>{index + 1}</strong>'s Extraction Summary
                                <br></br>
                                This news article publication date is <strong>{item.date}</strong>.
                                Name of the media is <strong>{item.mediaName}</strong>.
                                Title of the news article is <strong>{item.title}</strong>.
                                <br></br>
                                Here is a summary of news article: <strong>{item.articleSummary}</strong>
                                <br></br>
                                Here is a summary on the background of the media: <strong>{item.mediaBackgroundSummary}</strong>
                            </Text>
                        </>
                    ) : (
                        <Text type="danger">Error: Link {index + 1}</Text>
                    )}
                    {index === openaiResult.length - 1 && (
                        <>
                            <Button type="primary" onClick={createAndDownloadDoc}>Download Result as A Word Document</Button>
                            <div style={{ height: '20px' }} />
                        </>
                    )}
                </>

            ))}
        </Space >);
};

export default Home;