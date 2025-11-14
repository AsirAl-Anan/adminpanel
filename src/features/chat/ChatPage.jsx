import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, Info, Mic, Paperclip, Smile, Send, Reply, Heart, X } from 'lucide-react';
import socket from '../../config/socket.js';
import useUser from '../../context/useUser.js';
import EmojiPicker from 'emoji-picker-react';
import axios from '../../config/axios.js';
import { Image, FileText } from 'lucide-react';

// Message Component
const Message = ({ message, isOwn, time, isVoiceNote, duration, isReply, replyTo, sender, avatar, image, file, isSending, unq_id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isImage = image || file?.data;
 
  return (
    <div 
      className={`flex mb-3 md:mb-4 ${isOwn ? 'justify-end' : 'justify-start'} px-2 sm:px-4 relative group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && (
        <img 
          src={avatar} 
          alt={sender}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 mt-1 shadow-md ring-2 ring-white flex-shrink-0"
        />
      )}
      <div className={`max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-2xl sm:rounded-3xl backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] relative ${
        isOwn 
          ? 'bg-blue-100 text-gray-800 shadow-sm' 
          : 'bg-white text-gray-800 shadow-md border border-gray-200'
      }`}>
        {!isOwn && (
          <div className="text-xs font-semibold text-blue-600 mb-1 sm:mb-2">{sender}</div>
        )}

        {isReply && (
          <div className="border-l-4 border-blue-400 pl-2 sm:pl-3 mb-2 sm:mb-3 text-sm bg-blue-50 rounded-r-xl py-2 -mx-1">
            <div className="text-blue-600 text-xs font-medium">Labid replied to you</div>
            <div className="opacity-80 mt-1">{replyTo}</div>
          </div>
        )}

        {isVoiceNote ? (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                isOwn ? 'bg-blue-200' : 'bg-blue-100'
              } rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110`}
            >
              <div
                className={`w-0 h-0 border-l-[5px] sm:border-l-[6px] border-r-0 border-t-[2.5px] sm:border-t-[3px] border-b-[2.5px] sm:border-b-[3px] border-transparent border-l-blue-600`}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 sm:w-1 ${
                      isOwn ? 'bg-blue-400' : 'bg-blue-500'
                    } rounded-full transition-all duration-200 ${
                      Math.random() > 0.5 ? 'h-1.5 sm:h-2' : 'h-3 sm:h-5'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <span className="text-xs opacity-70 font-medium flex-shrink-0">{duration}</span>
          </div>
        ) : (
          <>
            {isImage && (
              <img
                src={image ? image : file?.data}
                alt="Image"
                className="max-w-[300px] max-h-[300px] object-contain rounded-lg mb-2"
              />
            )}
            <p className="text-sm sm:text-sm md:text-base leading-relaxed break-words">{message}</p>
          </>
        )}

        <div className="text-xs opacity-60 mt-1 sm:mt-2 text-right font-medium">
          {time}
        </div>

        {/* Sending indicator - only show for sending messages */}
        {isSending && isOwn && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-70 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs font-medium">Sending...</span>
            </div>
          </div>
        )}

        {/* Desktop hover actions - hidden on mobile */}
        {/* isHovered && !isSending && (
          <div className={`absolute ${isOwn ? '-left-16 sm:-left-20' : '-right-16 sm:-right-20'} top-1/2 transform -translate-y-1/2 hidden md:flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200`}>
            <div className="p-2 bg-white shadow-md rounded-full hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:scale-110">
              <Reply className="w-4 h-4 text-gray-600" />
            </div>
            <div className="p-2 bg-white shadow-md rounded-full hover:bg-red-100 cursor-pointer transition-all duration-200 hover:scale-110 group">
              <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
        ) */}
      </div>

      {isOwn && (
        <img 
          src={avatar} 
          alt="You"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ml-2 sm:ml-3 mt-1 shadow-md ring-2 ring-white flex-shrink-0"
        />
      )}
    </div>
  );
};

const Chat = () => {
  const imageInputRef = useRef();
  const documentInputRef = useRef();
  const messagesEndRef = useRef(null); // Add this ref for scrolling
  const messagesContainerRef = useRef(null); // Add this ref for the messages container
  const { user } = useUser(); //user is an email
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const attachmentRef = useRef(null);
  const emojiRef = useRef(null);
  const [sendingMessageId, setSendingMessageId] = useState(null); // Track specific message being sent

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  // Close attachment modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachmentRef.current && !attachmentRef.current.contains(event.target)) {
        setShowAttachmentModal(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showAttachmentModal || showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachmentModal, showEmojiPicker]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/message/get-messages');
      
      if (response.data.success !== true) {
        alert(response.data.message);
        return;
      }
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Scroll to bottom when messages change (including initial load)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listener for new messages
  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      // scrollToBottom will be called automatically due to the messages useEffect above
    });

    return () => {
      socket.off('receive_message');
    }; 
  }, []);

  // METHOD 1: Using FormData (Recommended for file uploads)
  const sendMessageWithFormData = async () => {
   
    if ((inputValue.trim() !== "" ||  selectedFile) && user !== null) {
      const messageId = new Date().getTime() + Math.random().toString();
      const formData = new FormData();
      
      // Add text data
      formData.append('unq_id', messageId);
      formData.append('sender', user);
      formData.append('message', inputValue);
      formData.append('isOwn', true);
      
      // Add file if exists
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('fileType', fileType);
      }
      
      try {
        const newMessage = {
          unq_id: messageId,
          sender: user,
          message: inputValue,
          file: selectedFile ? {
            name: selectedFile.name,
            type: fileType,
            data: filePreview, // Keep base64 for display
            size: selectedFile.size
          } : null,
          isOwn: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Set this message as sending
        setSendingMessageId(messageId);
        
        // Add message to state immediately
        setMessages((prev) => [...prev, newMessage]);
        
        // Clear input and file selection
        setInputValue('');
        clearFileSelection();
        
        // Emit to socket
        socket.emit('send_message', newMessage);
        
        // Send to backend via FormData
        const sendMsg = await axios.post('/message/send-message', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        
        // Clear sending state
        setSendingMessageId(null);
        
        if (sendMsg.data.success !== true) {
          alert(sendMsg.data.message);
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        setSendingMessageId(null);
        alert('Failed to send message');
      }
    }
  };

  // METHOD 2: Using Base64 (Current approach)
  const sendMessageWithBase64 = async () => {
    if ((inputValue.trim() !== "" || selectedFile) && user !== null) {
      const messageId = new Date().getTime() + Math.random().toString();
      
      const newMessage = {
        unq_id: messageId,
        sender: user,
        message: inputValue,
        file: selectedFile ? {
          name: selectedFile.name,
          type: fileType,
          data: filePreview, // Base64 string
          size: selectedFile.size,
          mimeType: selectedFile.type // Add MIME type for backend
        } : null,
        isOwn: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      try {
        // Set this message as sending
        setSendingMessageId(messageId);
        
        // Update state immediately
        setMessages((prev) => [...prev, newMessage]);
        
        // Clear input and file selection
        setInputValue('');
        clearFileSelection();
        
        // Send message to backend
        const sendMsg = await axios.post('/message/send-message', newMessage, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        
        // Emit to socket
        socket.emit('send_message', newMessage);
        
        // Clear sending state
        setSendingMessageId(null);
        
      } catch (error) {
        console.error('Error sending message:', error);
        setSendingMessageId(null);
        alert('Failed to send message');
      }
    }
  };

  // METHOD 3: Upload file first, then send message with file URL
  const sendMessageWithFileUpload = async () => {
    if ((inputValue.trim() !== "" || selectedFile) && user !== null) {
      const messageId = new Date().getTime() + Math.random().toString();
      let fileData = null;
      
      // Upload file first if exists
      if (selectedFile) {
        try {
          const fileFormData = new FormData();
          fileFormData.append('file', selectedFile);
          
          const uploadResponse = await axios.post('/upload/file', fileFormData, {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          
          if (uploadResponse.data.success) {
            fileData = {
              name: selectedFile.name,
              type: fileType,
              url: uploadResponse.data.fileUrl, // URL from server
              size: selectedFile.size,
              mimeType: selectedFile.type
            };
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload file');
          return;
        }
      }
      
      const newMessage = {
        unq_id: messageId,
        sender: user,
        message: inputValue,
        file: fileData,
        isOwn: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      try {
        // Set this message as sending
        setSendingMessageId(messageId);
        
        // For display purposes, add preview data
        const displayMessage = {
          ...newMessage,
          file: fileData ? {
            ...fileData,
            data: filePreview // Keep base64 for immediate display
          } : null
        };
        
        // Update state
        setMessages((prev) => [...prev, displayMessage]);
        
        // Clear input and file selection
        setInputValue('');
        clearFileSelection();
        
        // Send message with file URL
        const sendMsg = await axios.post('/message/send-message', newMessage, {
          withCredentials: true
        });
        
        
        // Emit to socket
        socket.emit('send_message', displayMessage);
        
        // Clear sending state
        setSendingMessageId(null);
        
      } catch (error) {
        console.error('Error sending message:', error);
        setSendingMessageId(null);
        alert('Failed to send message');
      }
    }
  };

  // Choose which method to use
  const sendMessage = sendMessageWithFormData; // Change this to switch methods

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
 
  const handleImageUpload = () => {
    imageInputRef.current.click();
    setShowAttachmentModal(false);
  };

  const handleDocumentUpload = () => {
    documentInputRef.current.click();
    setShowAttachmentModal(false);
  };

  const selectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setFileType('image');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const selectDocument = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
    // Define allowed document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid document file (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV)');
      return;
    }

    // Validate file size (e.g., max 10MB for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('Document size should be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setFileType('document');
    setFilePreview(null); // Documents don't need preview data
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {/* Header Buttons */}
      <div className="flex justify-end space-x-2 sm:space-x-3 md:space-x-4 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 flex-shrink-0 border-b border-gray-100">
        <div className="p-2 sm:p-2.5 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors cursor-pointer">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="p-2 sm:p-2.5 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors cursor-pointer">
          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        </div>
        <div className="p-2 sm:p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </div>
      </div>

      {/* Messages Area - This will scroll */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 space-y-1 sm:space-y-2 pb-4 min-h-0 scroll-smooth"
      >
        {messages.map((msg) => (
          <Message 
            key={msg.unq_id || msg._id} 
            {...msg} 
            isSending={sendingMessageId === msg.unq_id}
          />
        ))}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview Section */}
      {selectedFile && (
        <div className="px-2 sm:px-4 md:px-6 pb-2">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
              <button
                onClick={clearFileSelection}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
              
              {fileType === 'image' && filePreview && (
                <div className="flex items-start space-x-3">
                  <img 
                    src={filePreview} 
                    alt={selectedFile.name}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              )}
              
              {fileType === 'document' && (
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-md border flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Input Area - Fixed at bottom */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 bg-white w-full flex-shrink-0">
        <div className="flex items-end space-x-2 sm:space-x-3 md:space-x-4 max-w-4xl mx-auto">
          {/* Voice Button */}
         {/* <div className="p-2 sm:p-2.5 md:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 hover:scale-110 cursor-pointer flex-shrink-0">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </div>*/}
          
          {/* Attachment Button with Modal */}
          <div className="relative flex-shrink-0" ref={attachmentRef}>
            <div 
              className="p-2 sm:p-2.5 md:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 hover:scale-110 cursor-pointer"
              onClick={() => setShowAttachmentModal(!showAttachmentModal)}
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 rotate-45" />
            </div>
            
            {/* Attachment Modal */}
            {showAttachmentModal && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-[150px]">
                <div 
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={handleImageUpload}
                >
                  <Image className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Add Image</span>
                </div>
                <div 
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={handleDocumentUpload}
                >
                  {/* <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Add Document</span> */}
                </div>
              </div>
            )}
          </div>
          
          {/* Hidden File Inputs */}
          <input 
            type="file" 
            ref={imageInputRef} 
            onChange={selectImage}
            accept="image/*"
            style={{ display: 'none' }} 
          />
          <input 
            type="file" 
            ref={documentInputRef} 
            onChange={selectDocument}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            style={{ display: 'none' }} 
          />
          
          {/* Text Input Container */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full text-sm sm:text-base bg-white rounded-2xl sm:rounded-3xl px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 pr-12 sm:pr-14 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md border border-gray-200 resize-none min-h-[44px] sm:min-h-[48px] md:min-h-[56px] max-h-[120px] transition-all duration-200 overflow-y-scroll"
              rows="1"
            />
            
            {/* Emoji Button */}
            <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4" ref={emojiRef}>
              {/* Emoji Picker Modal - Properly positioned above the input */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker 
                    onEmojiClick={(emojiObject) => {
                      setInputValue(prev => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width={280}
                    height={350}
                  />
                </div>
              )}
              <Smile 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" 
              /> 
            </div>
          </div>
          
          {/* Send Button */}
          <div className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer shadow flex-shrink-0 ${
            inputValue.trim() || selectedFile 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
            <Send 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              onClick={sendMessage} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
