import TodoStore from './store';

export const todosStore = new TodoStore();

export default function initTodos(stores: { todos?: any }, actions: any) {
  // eslint-disable-next-line no-param-reassign
  stores.todos = todosStore;
  todosStore.start(stores, actions);
}
