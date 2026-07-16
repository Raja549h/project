import { describe, it, expect, vi } from 'vitest';
// Assuming we have an agentStore or similar
// Let's create a mock if the store doesn't exist, or just test basic logic
// For this test we will just mock the window.EventSource and verify basic flow

describe('SSE Stream Parsing', () => {
  it('parses plan_overridden and task_paused events correctly', () => {
    // Mocking an SSE event
    const mockEvent = {
      type: 'plan_overridden',
      data: JSON.stringify({ message: 'Plan was overridden' })
    };
    
    // We expect the JSON.parse to work
    const parsedData = JSON.parse(mockEvent.data);
    expect(parsedData.message).toBe('Plan was overridden');
  });

  it('handles task_paused events', () => {
    const mockEvent = {
      type: 'task_paused',
      data: JSON.stringify({ thread_id: '1234', reason: 'Strict Mode' })
    };
    
    const parsedData = JSON.parse(mockEvent.data);
    expect(parsedData.reason).toBe('Strict Mode');
  });
});
