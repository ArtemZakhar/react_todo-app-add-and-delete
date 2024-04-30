import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Action } from '../../types/actions';
import { DispatchContext } from '../../store/todoReducer';
import { TodoFromServer } from '../../types/state';
import { deleteTodo, updateTodo } from '../../api/todos';

type Props = {
  todo: TodoFromServer;
  onError: (message: string) => void;
  coverShow: number[];
  onCoverShow: React.Dispatch<React.SetStateAction<number[]>>;
};

export const TodoItem: FC<Props> = ({
  todo,
  onError,
  coverShow,
  onCoverShow,
}) => {
  const [updateMode, setUpdateMode] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);
  const newTitleRef = useRef<HTMLInputElement>(null);
  const dispatch = useContext(DispatchContext);

  useEffect(() => {
    if (updateMode) {
      if (newTitleRef.current) {
        newTitleRef.current.focus();
      }
    }
  }, [updateMode]);

  const handeUpdateRequest = (id: number, data: Partial<TodoFromServer>) => {
    updateTodo(id, todo)
      .then(() => {
        dispatch({
          type: Action.updateTodo,
          payload: { id, data },
        });
      })
      .catch(() => {
        onCoverShow([]);
        onError('Unable to update a todo');
      })
      .finally(() => {
        setUpdateMode(false);
        onCoverShow([]);
      });
  };

  const saveNewTitle = () => {
    if (newTitle.length === 0) {
      deleteTodo(todo.id)
        .then(() => {
          dispatch({
            type: Action.deleteTodo,
            payload: todo.id,
          });
          onCoverShow([]);
        })
        .catch(() => {
          onError('Unable to delete a todo');
          onCoverShow([]);
        });
    }

    const title = newTitle.trim();

    handeUpdateRequest(todo.id, { title });
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    id: number,
  ) => {
    event.preventDefault();
    onCoverShow([id]);

    saveNewTitle();
  };

  const handleUpdateComplete = (completed: Partial<TodoFromServer>) => {
    onCoverShow([todo.id]);

    // dispatch({
    //   type: Action.updateTodo,
    //   payload: { id, data: completed },
    // });

    handeUpdateRequest(todo.id, completed);
  };

  const handleRemove = () => {
    onCoverShow([todo.id]);

    deleteTodo(todo.id)
      .then(() => {
        dispatch({ type: Action.deleteTodo, payload: todo.id });
        onCoverShow([]);
      })
      .catch(() => {
        onError('Unable to delete a todo');
        onCoverShow([]);
      });
  };

  return (
    <li key={todo.id}>
      <div data-cy="Todo" className={`todo ${todo.completed && 'completed'}`}>
        {/* eslint-disable-next-line */}
        <label className="todo__status-label">
          <input
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={todo.completed}
            onChange={() =>
              handleUpdateComplete({ completed: !todo.completed })
            }
          />
        </label>
        {updateMode ? (
          <>
            <form onSubmit={event => handleSubmit(event, todo.id)}>
              <input
                data-cy="TodoTitleField"
                type="text"
                ref={newTitleRef}
                className="todo__title-field"
                placeholder="Empty todo will be deleted"
                value={newTitle}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    setUpdateMode(false);
                    setNewTitle(todo.title);
                  }
                }}
                onChange={event => setNewTitle(event.target.value)}
                onBlur={() => saveNewTitle()}
              />
            </form>
          </>
        ) : (
          <>
            <span
              data-cy="TodoTitle"
              className="todo__title"
              onDoubleClick={() => setUpdateMode(true)}
            >
              {todo.title}
            </span>

            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              onClick={handleRemove}
            >
              ×
            </button>
            <div
              data-cy="TodoLoader"
              className={`modal overlay ${coverShow.includes(todo.id) && 'is-active'}`}
            >
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </>
        )}
      </div>
    </li>
  );
};
