import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, CreditCard as Edit2, X } from 'lucide-react';

type Priority = 'low' | 'medium' | 'high';
type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  text: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const stored = localStorage.getItem('todos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos(prev => [
      { id: crypto.randomUUID(), text, priority, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput('');
    setPriority('medium');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, text: editText.trim() } : t))
    );
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const clearAll = () => {
    setTodos([]);
    setShowConfirm(false);
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const priorityConfig = {
    high: { color: 'bg-red-100 border-red-300', textColor: 'text-red-600', dot: 'bg-red-500' },
    medium: { color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-600', dot: 'bg-yellow-500' },
    low: { color: 'bg-green-100 border-green-300', textColor: 'text-green-600', dot: 'bg-green-500' },
  };

  const getPriorityLabel = (p: Priority) => {
    return p === 'high' ? '高' : p === 'medium' ? '中' : '低';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-100 to-purple-100 flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl">✨</span>
          <h1 className="text-3xl font-bold text-purple-700 tracking-tight">我的待办清单</h1>
          <span className="text-4xl">📝</span>
        </div>
        <p className="text-purple-400 text-sm">保持专注，逐一完成</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-purple-100 overflow-hidden">

        {/* Input */}
        <div className="p-5 border-b border-purple-50">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="今天想做些什么呢？"
              className="flex-1 rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-2.5 text-sm text-gray-700 placeholder-purple-300 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
            />
            <button
              onClick={addTodo}
              className="flex items-center gap-1 rounded-xl bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-4 py-2.5 text-sm font-medium shadow-md shadow-purple-200 transition-all"
            >
              <span>➕ 添加</span>
            </button>
          </div>
          <div className="flex gap-2">
            {(['high', 'medium', 'low'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  priority === p
                    ? `${priorityConfig[p].color} border-2`
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getPriorityLabel(p)}优先级
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-purple-50 bg-purple-50/30">
          {(['all', 'active', 'completed'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                filter === f
                  ? 'text-purple-600 border-b-2 border-purple-500 bg-white'
                  : 'text-purple-400 hover:text-purple-500'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '未完成' : '已完成'}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <ul className="divide-y divide-purple-50 max-h-[480px] overflow-y-auto">
          {filtered.length === 0 && (
            <li className="py-16 px-5 text-center">
              <div className="text-5xl mb-4">
                {filter === 'completed' ? '🎉' : '🚀'}
              </div>
              <p className="text-purple-400 font-semibold mb-1">
                {filter === 'completed' ? '暂无已完成任务' : '暂无任务'}
              </p>
              <p className="text-purple-300 text-xs">
                {filter === 'completed' ? '完成一些任务看看吧！' : '添加你的第一个任务吧！'}
              </p>
            </li>
          )}
          {filtered.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 px-5 py-3.5 group hover:bg-purple-50/40 transition-colors"
            >
              <div className={`w-1 h-6 rounded-full ${priorityConfig[todo.priority].dot}`} />
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0 text-purple-400 hover:text-purple-600 transition-colors"
              >
                {todo.completed
                  ? <CheckCircle2 size={20} className="text-purple-500" />
                  : <Circle size={20} className="text-purple-300 group-hover:text-purple-400" />
                }
              </button>
              {editingId === todo.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(todo.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="text-green-500 hover:text-green-600 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm leading-relaxed transition-all ${
                      todo.completed
                        ? 'line-through text-purple-300'
                        : 'text-gray-700'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityConfig[todo.priority].color} ${priorityConfig[todo.priority].textColor}`}>
                    {getPriorityLabel(todo.priority)}
                  </span>
                  <button
                    onClick={() => startEdit(todo.id, todo.text)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 transition-all"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-purple-50 bg-purple-50/20 flex items-center justify-between gap-2">
          <div className="flex gap-3 text-xs text-purple-400">
            <span>
              未完成 <span className="font-semibold text-purple-500">{activeCount}</span>
            </span>
            <span>·</span>
            <span>
              已完成 <span className="font-semibold text-purple-500">{completedCount}</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-purple-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                清空已完成
              </button>
            )}
            {todos.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-purple-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                全部清空
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">确认清空所有任务？</h3>
            <p className="text-sm text-gray-600 mb-6">此操作无法撤销，将永久删除所有 {todos.length} 个任务。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={clearAll}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all font-medium text-sm"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-purple-300">数据已自动保存至本地</p>
    </div>
  );
}
