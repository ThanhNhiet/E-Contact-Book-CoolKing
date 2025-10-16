import React, { useState } from 'react';
import HeaderLeCpn from '../../components/lecturer/HeaderLeCpn';
import ChatListCpn from '../../components/shared/chatfeaturecpn/ChatListCpn';
import ChatInfoCpn from '../../components/shared/chatfeaturecpn/ChatInfoCpn';
import MessageConversationCpn from '../../components/shared/chatfeaturecpn/MessageConversationCpn';
import ImagesCollectionModal from './ImagesCollectionModal';
import FilesCollectionModal from './FilesCollectionModal';
import LinksCollectionModal from './LinksCollectionModal';
import SearchResultModal from './SearchResultModal';

const ChatMainPage: React.FC = () => {
    const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [showFilesModal, setShowFilesModal] = useState(false);
    const [showLinksModal, setShowLinksModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleChatSelect = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const handleShowImages = () => {
        setShowImagesModal(true);
    };

    const handleShowFiles = () => {
        setShowFilesModal(true);
    };

    const handleShowLinks = () => {
        setShowLinksModal(true);
    };

    const handleShowSearchResults = (results: any[], keyword: string = '') => {
        setSearchResults(results);
        setSearchKeyword(keyword);
        setShowSearchModal(true);
    };

    return (
        <div className="max-h-screen bg-gray-50 flex flex-col">
            <HeaderLeCpn />
            
            {/* Main Chat Interface */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat List - Left Panel */}
                <div className="w-80 flex-shrink-0">
                    <ChatListCpn 
                        onChatSelect={handleChatSelect}
                        selectedChatId={selectedChatId}
                    />
                </div>

                {/* Message Conversation - Center Panel */}
                <div className="flex-1 flex flex-col">
                    <MessageConversationCpn
                        selectedChatId={selectedChatId}
                        onShowSearchResults={(results) => handleShowSearchResults(results, 'search')}
                    />
                </div>

                {/* Chat Info - Right Panel */}
                <div className="w-80 flex-shrink-0 border-l border-gray-200">
                    <ChatInfoCpn
                        selectedChatId={selectedChatId}
                        onShowImages={handleShowImages}
                        onShowFiles={handleShowFiles}
                        onShowLinks={handleShowLinks}
                    />
                </div>
            </div>

            {/* Modals */}
            {selectedChatId && (
                <>
                    <ImagesCollectionModal
                        isOpen={showImagesModal}
                        onClose={() => setShowImagesModal(false)}
                        chatId={selectedChatId}
                    />
                    
                    <FilesCollectionModal
                        isOpen={showFilesModal}
                        onClose={() => setShowFilesModal(false)}
                        chatId={selectedChatId}
                    />
                    
                    <LinksCollectionModal
                        isOpen={showLinksModal}
                        onClose={() => setShowLinksModal(false)}
                        chatId={selectedChatId}
                    />
                </>
            )}

            <SearchResultModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                searchResults={searchResults}
                searchKeyword={searchKeyword}
            />

            {/* <FooterLeCpn /> */}
        </div>
    );
};

export default ChatMainPage;
