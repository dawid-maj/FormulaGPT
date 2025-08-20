/**
 * Hook managing API-related state and functionality
 */
import { useState, useRef } from 'react';

export const useApiState = () => {
  // API interaction states
  const [apiResponsesPending, setApiResponsesPending] = useState(false);
  const [lastApiTriggerLap, setLastApiTriggerLap] = useState(0);
  const [expectedNotificationCount, setExpectedNotificationCount] = useState(null);
  const [apiQueryStartTime, setApiQueryStartTime] = useState(null);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Team and command management
  const [conversationHistory, setConversationHistory] = useState({});
  const [pendingCommands, setPendingCommands] = useState([]);
  const [aiPendingCommands, setAiPendingCommands] = useState([]);

  // Notification system states
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationPause, setNotificationPause] = useState(false);

  // Refs for API functionality
  const conversationHistoryRef = useRef({});
  const pendingCommandsRef = useRef([]);
  const teamApiCooldownRef = useRef({});
  const teamApiLastLapRef = useRef({});
  const teamLastEventTimeRef = useRef({});

  return {
    // API states
    apiResponsesPending,
    setApiResponsesPending,
    lastApiTriggerLap,
    setLastApiTriggerLap,
    expectedNotificationCount,
    setExpectedNotificationCount,
    apiQueryStartTime,
    setApiQueryStartTime,
    isApiConfigModalOpen,
    setIsApiConfigModalOpen,
    apiError,
    setApiError,

    // Command and conversation states
    conversationHistory,
    setConversationHistory,
    pendingCommands,
    setPendingCommands,
    aiPendingCommands,
    setAiPendingCommands,

    // Notification states
    notifications,
    setNotifications,
    isModalOpen,
    setIsModalOpen,
    selectedNotification,
    setSelectedNotification,
    notificationPause,
    setNotificationPause,

    // Refs
    conversationHistoryRef,
    pendingCommandsRef,
    teamApiCooldownRef,
    teamApiLastLapRef,
    teamLastEventTimeRef
  };
};