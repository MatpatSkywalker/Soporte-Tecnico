import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateTicket, 
  useUpdateTicketStatus, 
  useAddComment, 
  getListTicketsQueryKey, 
  getGetTicketQueryKey 
} from "@workspace/api-client-react";

export function useTicketMutations() {
  const queryClient = useQueryClient();

  const createTicket = useCreateTicket({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
      }
    }
  });

  const updateStatus = useUpdateTicketStatus({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(variables.id) });
      }
    }
  });

  const addComment = useAddComment({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(variables.id) });
      }
    }
  });

  return { 
    createTicket, 
    updateStatus, 
    addComment 
  };
}
