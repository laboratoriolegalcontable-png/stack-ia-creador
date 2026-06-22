import { useState, useEffect, useRef } from "react";

export function useApprovalWatch(approvalId: string | null | undefined) {
  const [status, setStatus] = useState<string>("not_found");
  const [approval, setApproval] = useState<any>(null);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!approvalId) {
      setStatus("not_found");
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/approval/${approvalId}`);
        if (res.ok) {
          const data = await res.json();
          setApproval(data.record);
          const s = data.record?.status || "not_found";
          if (s !== prevStatusRef.current) {
            prevStatusRef.current = s;
          }
          setStatus(s);
        }
      } catch {
        // ignore transient network errors
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [approvalId]);

  return {
    status,
    approval,
    isPending: status === "pending",
    isApproved: status === "approved",
    isRejected: status === "rejected",
    isResolved: status === "approved" || status === "rejected",
    isLoading: status === "not_found" && !!approvalId,
  };
}

export function usePendingApprovals(workflowId: string | null | undefined) {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    if (!workflowId) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/approval?workflowId=${workflowId}`);
        if (res.ok) {
          const data = await res.json();
          setPendingApprovals((data.records || []).filter((r: any) => r.status === "pending"));
        }
      } catch {
        // ignore
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [workflowId]);

  return { pendingApprovals, hasPending: pendingApprovals.length > 0, count: pendingApprovals.length };
}

export function useExecutionApprovals(executionId: string | null | undefined) {
  const [approvals, setApprovals] = useState<any[]>([]);

  useEffect(() => {
    if (!executionId) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/approval?executionId=${executionId}`);
        if (res.ok) {
          const data = await res.json();
          setApprovals(data.records || []);
        }
      } catch {
        // ignore
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [executionId]);

  const pendingApprovals = approvals.filter(a => a.status === "pending");

  return { approvals, pendingApprovals, hasPending: pendingApprovals.length > 0, isPaused: pendingApprovals.length > 0 };
}
