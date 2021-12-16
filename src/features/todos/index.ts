import TodoStore from './store';

export const todosStore = new TodoStore();

export default function initTodos(stores: { todos?: any }, actions: any) {
  stores.todos = todosStore;
  todosStore.start(stores, actions);
}
