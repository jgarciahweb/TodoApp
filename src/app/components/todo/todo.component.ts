import {Component, computed, effect, signal} from '@angular/core';
import {FilterType, TodoModel} from "../../models/todo";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  todolist = signal<TodoModel[]>([]);

  filter = signal<FilterType>('all')

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todolist();

    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return  todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  });

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  });

  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()))
    });
  }

  ngOnInit(): void {
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todolist.set(JSON.parse(storage));
    }
  }

  changeFilter(filterString: FilterType) {
    this.filter.set(filterString);
  }

  addTodo(): void {
    const newTodoTitle = this.newTodo.value.trim();

    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todolist.update((prev_todos) => {
        return [
          ...prev_todos,
          {id: Date.now(), title: newTodoTitle, completed: false},
        ]
      });
      this.newTodo.reset();
    } else {
      this.newTodo.reset();
    }
  }

  toggleTodo(id: number) {
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id === id ? {...todo, completed: !todo.completed} : todo;
      }))
  }

  removeTodo(id: number) {
    this.todolist.update((prev_todos) =>
      prev_todos.filter((todo) => todo.id !== id),
    )
  }

  updateTodoEditingMode(id: number) {
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id === id ? {...todo, editing: true} : {...todo, editing: false};
      }))
  }

  saveTitleTodo(id: number, event: Event) {
    const title = (event.target as HTMLInputElement).value;
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id === id ? {...todo, title: title, editing: false} : todo;
      })
    )
  }
}
