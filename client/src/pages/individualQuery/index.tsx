import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect, useState, ComponentPropsWithoutRef  } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useNavigate, useLocation } from "react-router-dom";
import linkIcon from '@/assets/icons/link-icon.svg';
import { Box, Button, Theme } from '@mui/material';
import { createApiClient } from "../../api/fetch";
import { useUser } from "../../hooks/useUser"; 
import { useParams } from "react-router-dom";
import useToast from "../../hooks/useToast"; 
import { IQueries } from "../queryHistory"; 
import ReactMarkdown from 'react-markdown';

const IndividualQuery:React.FC = () => {
    const { isLoading: isLoadingUser, user, token } = useUser();
    const [query, setQuery] = useState<IQueries>();
    const showToast = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const previousAddress = location.state?.from;

    const urlParams = previousAddress.split('/')[2];
    const getQuery = async () => {
        if (!isLoadingUser && token && user ) {

            const apiClient = createApiClient({token, userId: user.id })
            
            if (id) {
                const response = await apiClient.getQueryById(id);
                if (response.error) return showToast(response.error, 'error');       
                setQuery(response.data)
            }
            
        }
    }

    useEffect(() => {
        getQuery()
    },[isLoadingUser, id])

    return (
        <Box
            sx={{
                width: '100%',                
                overflowY: 'auto',
                boxSizing: 'border-box',
                backgroundColor: (theme: Theme) => theme.palette.secondary.main,
                color: (theme: Theme) => theme.palette.text.primary,
                fontSize: '1rem',
                lineHeight: '1.5',
                padding: '1rem',
                "& h1": {
                    fontSize: '1.5rem',
                    textAlign: 'center'
                },
                "& h2": {
                    fontSize: '1.3rem'
                },
                "& h3": {
                    fontSize: '1.1rem'
                },

                "& a": {
                    fontSize: '1rem',
                    color: (theme: Theme) => theme.palette.primary.main,
                    position: 'relative',
                    fontWeight: 'bold',
                    marginRight: '1.3rem',
                    maxWidth: '30rem',
                    WebkitBoxOrient: 'vertical',  
                    WebkitLineClamp: 1,
                    textOverflow: 'ellipsis'
                    
                },
                "& a::after": {
                    position: 'absolute',
                    right: '-1.1rem',
                    top: 0,
                    content: "''", 
                    width: '0.8rem',
                    height: '0.8rem',
                    backgroundImage: `url(${linkIcon})`,
                    backgroundSize: 'contain', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'center' 
                },
                '&::-webkit-scrollbar': {
                    width: '0.4rem'
                },
                '&::-webkit-scrollbar-track': {
                    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                    webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgb(108, 87, 117)',
                    outline: '1px solid slategrey'
                }
            }}
        >
            <Box
                sx={{
                    maxWidth: '50rem',                       
                    margin: '0 auto'
                }}
                >
                <Button onClick={() =>{
                    urlParams ? navigate('/chat') : navigate(previousAddress);
                }}>
                    Go back
                </Button>
                <ReactMarkdown
                    components={{
                        code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        a: ({node, id, ...props}) => (
                            <a target="_blank" rel="noopener noreferrer" {...props} />
                        )
                    }}
                >
                    { query?.result }
                </ReactMarkdown>
            </Box>
        </Box>
    )
}

export default IndividualQuery