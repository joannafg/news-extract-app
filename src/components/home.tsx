import React, { useState } from "react";
import '../index.css';
import { Input } from 'antd';
import { Button, Flex, Typography } from 'antd';
import { Card, Space, Dropdown, Menu, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { Spin } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, DownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, VerticalAlign } from "docx";
import { parse, isValid, compareAsc, compareDesc } from 'date-fns';
import openaiResults from './openaiResult.json';


const { Text, Link } = Typography;
const { TextArea } = Input;


interface IOpenAIResult {
    date: string;
    mediaName: string;
    title: string;
    articleSummary: string;
    mediaBackgroundSummary: string;
}

//TODO: store the 20 most recent results in cookie. search the cookie first before submitting a request to gpt. 
//TODO: check if the website is srapable before clicking submit. 
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
    // const [openaiResult, setOpenaiResult] = useState<IOpenAIResult[]>(openaiResults);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [arr, setArr] = useState(inputArr);
    const [sortOption, setSortOption] = useState("ascending");


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
                    } else {
                        retries = 3;
                    }
                    updateOpenAIResult(index, response.data.parsedData);
                    updateMessage(index, `Response: ${response.data.message}. Data received: ${JSON.stringify(response.data)}`);
                    // const sortedResults = sortResultsByDate(openaiResult);
                    // setOpenaiResult(sortedResults);
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

            switch (sortOption) {
                case "ascending": {
                    sortAllDatesAscending();
                    break;
                }
                case "descending": {
                    sortAllDatesDescending();
                    break;
                }
                default: {
                    sortAllDatesAscending();
                    break;
                }
            }

            if (index === arr.length - 1) { setIsLoading(false); }
        };
    };

    const monthMap: { [key: string]: number } = {
        January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const tryParseCustom = (dateStr: string): Date | undefined => {
        const yearMatch = dateStr.match(/\b(19[8-9]\d|20[0-3]\d)\b/);
        const monthMatch = dateStr.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);
        const dayMatch = dateStr.match(/\b(3[01]|[12][0-9]|0?[1-9])(st|nd|rd|th)?\b/);

        if (yearMatch && monthMatch && dayMatch) {
            const year = parseInt(yearMatch[0]);
            const month = monthMap[monthMatch[0]];
            const day = parseInt(dayMatch[0]);

            return new Date(year, month, day);
        }
    };

    // Sorting function
    const sortResultsByDateAscending = (results: IOpenAIResult[]): IOpenAIResult[] => {
        return results.sort((a, b) => {
            const dateA = tryParseCustom(a.date);
            const dateB = tryParseCustom(b.date);

            // Handle invalid or unknown dates by pushing them to the end
            if (!dateA) return 1;
            if (!dateB) return -1;

            return compareAsc(dateA, dateB);
        });
    };

    const sortAllDatesAscending = () => {
        setIsDataFetched(true);
        setOpenaiResult(currentResults => {
            // Create a new array instance and sort
            const sortedResults = sortResultsByDateAscending([...currentResults]);
            return sortedResults;
        });
    };

    const sortAllDatesDescending = () => {
        setIsDataFetched(true);
        setOpenaiResult(currentResults => {
            // Create a new array instance and sort in reverse order
            const sortedResults = sortResultsByDateAscending([...currentResults]).reverse();
            return sortedResults;
        });
    };

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === "1") {
            setSortOption("ascending");
            sortAllDatesAscending();
        } else if (e.key === "2") {
            setSortOption("descending");
            sortAllDatesDescending();
        }
    };

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="1">Sort by Date Ascending</Menu.Item>
            <Menu.Item key="2">Sort by Date Descending</Menu.Item>
        </Menu>
    );



    return (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Card style={{ boxShadow: "5px 8px 24px 5px rgba(190, 196, 137, 0.6)" }}>
                <Space direction="vertical" size="middle" style={{ display: 'flex' }} >
                    <Space direction="horizontal" >
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
                            <Tooltip title="Please include the full web address. exp. https://..." color={'#889900'} >
                                <InfoCircleOutlined />
                            </Tooltip>
                        </div>
                        <Dropdown overlay={menu} placement="bottomLeft" arrow={{ pointAtCenter: true }}>
                            <Space style={{ color: "#6a7800" }}>{sortOption === "ascending" ? "Sort by Date Ascending" : "Sort by Date Descending"}<DownOutlined /></Space>
                        </Dropdown>
                    </Space>

                    {/* <Text type="secondary">Please include the full web address. exp. https://...</Text> */}
                    {arr.map((item, i) => {
                        return (
                            <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                                {item.type === "link" ? (
                                    <Input
                                        onChange={(e) => handleChange(e, i)}
                                        value={item.value}
                                        id={i.toString()}
                                        size="middle"
                                        style={{ flexGrow: 1, marginRight: '10px' }} // Adjusted style
                                        placeholder="Paste your link here"
                                    />
                                ) : (
                                    <TextArea
                                        onChange={(e) => handleChange(e, i)}
                                        value={item.value}
                                        id={i.toString()}
                                        size="middle"
                                        style={{ flexGrow: 1, marginRight: '10px' }} // Adjusted style
                                        placeholder="Paste your article here"
                                        maxLength={3000}
                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                    />
                                )}
                                <Button type="primary" icon={<DeleteOutlined />} onClick={(e) => deleteInput(e, i)} size={"middle"} />
                            </Flex>
                        );
                    })}
                    <Space direction="horizontal" >
                        <Button type="primary" size={"middle"} onClick={(e) => addInput()}>Add New Link</Button>
                        <Button type="primary" size={"middle"} onClick={addTextArea}>Add New Article</Button>
                    </Space>
                    <div></div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, padding: '10px' }}>
                        <Button type="primary" size={"middle"} loading={isLoading} onClick={(e) => fetchMessages()}>Submit</Button>
                    </div>


                </Space>
            </Card >
            {/* <Button type="primary" size={"middle"} onClick={sortAllDatesAscending}>sortAllDatesAscending</Button>
            <Button type="primary" size={"middle"} onClick={sortAllDatesDescending}>sortAllDatesDescending</Button> */}
            {isLoading && <Spin size="large" />}
            {
                isDataFetched && openaiResult.map((item, index) => (
                    <>
                        {console.log(openaiResult)}
                        {index === 0 && (
                            <div
                                style={{
                                    borderColor: '#889900',
                                    borderStyle: 'dotted',
                                    borderWidth: '1px',
                                    width: '100%',
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
                            <div style={{ textAlign: 'right' }}>
                                <Button type="primary" onClick={createAndDownloadDoc}>Download Result as A Word Document</Button>
                                <div style={{ height: '20px' }} />
                            </div>
                        )}
                    </>

                ))
            }
        </Space >);
};

export default Home;