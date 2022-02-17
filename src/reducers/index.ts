import { omit } from "lodash";

export const initialState = {
  nodes: [],
  connections: []
}

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "nodes":
      return {
        ...state,
        nodes: action.payload
      }
    case "connections":
      return {
        ...state,
        connections: action.payload.map((x: any) => x)
      }
    case "single":
      return {
        ...state
      }
    case "created":
      return {
        ...state,
        nodes: {...state.nodes, [action.payload.key]: action.payload}
      }
    case "deleted":
      return {
        ...state,
        nodes: {...omit(state.nodes, action.payload.key)}
      }
    case "updated":
      return {
        ...state,
        nodes: {...state.nodes, [action.payload.key]: action.payload}
      }
    default:
      throw new Error()
  }
}

export const nodes = (data: any) => ({ type: "nodes", payload: data || {} })
export const connections = (data: any) => ({ type: "connections", payload: data || [] })
export const getSingleNode = (data: any) => ({ type: "single", payload: data })
export const nodeCreated = (data: any) => ({ type: "created", payload: data })
export const nodeDeleted = (data: any) => ({ type: "deleted", payload: data })
export const nodeUpdated = (data: any) => ({ type: "updated", payload: data })
