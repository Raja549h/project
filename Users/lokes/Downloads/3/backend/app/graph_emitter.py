"""Graph Emitter — Converts LangGraph and GOAP state into UI-friendly Network format."""

from typing import Any

def generate_graph_payload(
    state_node: str,
    sub_tasks: list[dict],
    worker_results: list[dict],
    is_replan: bool = False
) -> dict[str, Any]:
    """
    Generates a structured JSON payload representing the current active topology of the swarm.
    This is sent via SSE to the React frontend to be rendered in the NetworkGraph component.
    """
    nodes = []
    edges = []
    
    # 1. Base Nodes
    nodes.append({"id": "start", "label": "User Input", "type": "input", "status": "completed"})
    
    mr_status = "running" if state_node == "meta_router" else "completed"
    if is_replan:
        mr_status = "running"
    nodes.append({"id": "meta_router", "label": "Meta Router (GOAP)", "type": "router", "status": mr_status})
    
    edges.append({"source": "start", "target": "meta_router"})
    
    # 2. Dynamic GOAP Sub-Tasks (Swarm Workers)
    completed_workers = {res.get("node_id") for res in worker_results}
    
    for i, task in enumerate(sub_tasks):
        node_id = task.get("id", f"task_{i}")
        intent = task.get("intent", "general")
        
        # Determine status
        if state_node == "meta_router":
            status = "pending"
        elif state_node == "execute_workers":
            status = "completed" if node_id in completed_workers else "running"
        else:
            status = "completed"
            
        nodes.append({
            "id": node_id,
            "label": f"Worker: {intent}",
            "type": "worker",
            "status": status,
            "description": task.get("description", "")[:50] + "..."
        })
        
        # Dependencies (Edges)
        depends_on = task.get("depends_on", [])
        if not depends_on:
            edges.append({"source": "meta_router", "target": node_id})
        else:
            for dep in depends_on:
                edges.append({"source": dep, "target": node_id})
                
    # 3. Aggregation Nodes (Synthesize & Evaluate)
    if sub_tasks:
        synth_status = "pending"
        if state_node == "synthesize":
            synth_status = "running"
        elif state_node in ["evaluate", "finish"]:
            synth_status = "completed"
            
        nodes.append({"id": "synthesize", "label": "Synthesizer", "type": "aggregator", "status": synth_status})
        
        # Link leaf tasks to synthesizer
        # Leaf tasks are those that are not depended on by any other task
        all_deps = set()
        for task in sub_tasks:
            all_deps.update(task.get("depends_on", []))
            
        for task in sub_tasks:
            node_id = task.get("id", f"task_{sub_tasks.index(task)}")
            if node_id not in all_deps:
                edges.append({"source": node_id, "target": "synthesize"})
                
        # Evaluate Node
        eval_status = "pending"
        if state_node == "evaluate":
            eval_status = "running"
        elif state_node == "finish":
            eval_status = "completed"
            
        nodes.append({"id": "evaluate", "label": "Constitutional Council", "type": "judge", "status": eval_status})
        edges.append({"source": "synthesize", "target": "evaluate"})
        
    return {
        "nodes": nodes,
        "edges": edges,
        "current_node": state_node
    }
