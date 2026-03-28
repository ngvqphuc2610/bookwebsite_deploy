import React, { useState, useEffect } from 'react';
import { genreService } from '@/services/api';
import { Plus, Edit2, Trash2, X, Check, Search, Hash, MessageSquare, Info, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffLayout } from '@/components/staff-layout';
import { Badge } from '@/components/ui/badge';

const AdminGenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const response = await genreService.getAll();
            setGenres(response.data);
        } catch (error) {
            console.error('Failed to fetch genres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newForm.name.trim()) return;
        try {
            await genreService.create(newForm);
            setIsAdding(false);
            setNewForm({ name: '', description: '' });
            fetchGenres();
        } catch (error) {
            alert('Lỗi khi thêm thể loại');
        }
    };

    const handleUpdate = async (id) => {
        if (!editForm.name.trim()) return;
        try {
            await genreService.update(id, editForm);
            setIsEditing(null);
            fetchGenres();
        } catch (error) {
            alert('Lỗi khi cập nhật thể loại');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
            try {
                await genreService.delete(id);
                fetchGenres();
            } catch (error) {
                alert('Lỗi khi xóa thể loại');
            }
        }
    };

    const filteredGenres = genres.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <StaffLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <LayoutGrid size={14} />
                        Phân loại nội dung
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Quản lý thể loại</h1>
                    <p className="text-slate-500 font-medium">Hệ thống phân loại giúp người dùng tìm kiếm truyện dễ dàng hơn.</p>
                </div>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 font-bold"
                >
                    <Plus className="h-5 w-5" />
                    Thêm thể loại mới
                </Button>
            </div>

            <div className="mb-10 group relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <Input
                    placeholder="Tìm kiếm nhanh chuyên mục..."
                    className="pl-12 py-6 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isAdding && (
                    <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200 shadow-inner animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                                    <Plus size={18} />
                                </div>
                                <h2 className="font-black text-xl text-indigo-900">Thêm Một Chuyên Mục Mới</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full text-indigo-400 hover:bg-white hover:text-indigo-600">
                                <X size={20} />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-900/50 uppercase tracing-widest ml-1">Tên thể loại</label>
                                <Input
                                    placeholder="Ví dụ: Hành động, Tình cảm..."
                                    className="bg-white border-white/50 py-6 rounded-xl"
                                    value={newForm.name}
                                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-900/50 uppercase tracing-widest ml-1">Mô tả ngắn</label>
                                <Input
                                    placeholder="Nội dung tóm tắt về thể loại..."
                                    className="bg-white border-white/50 py-6 rounded-xl"
                                    value={newForm.description}
                                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsAdding(false)}>Hủy bỏ</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-indigo-100" onClick={handleAdd}>Tạo chuyên mục ✨</Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-slate-400">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="font-bold">Đang tải tài nguyên chuyên mục...</p>
                    </div>
                ) : filteredGenres.length > 0 ? (
                    filteredGenres.map(genre => (
                        <div key={genre.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            {/* Decorative background number */}
                            <div className="absolute -right-4 -top-8 text-[8rem] font-black text-slate-50 pointer-events-none select-none group-hover:text-indigo-50/50 transition-colors">
                                #{genre.id}
                            </div>

                            {isEditing === genre.id ? (
                                <div className="space-y-5 relative z-10 animate-in fade-in transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                            <Edit2 size={16} />
                                        </div>
                                        <h3 className="font-black text-slate-900">Hiệu chỉnh chuyên mục</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <Input
                                            value={editForm.name}
                                            className="bg-slate-50 border-slate-100 py-6 rounded-2xl font-bold"
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                        <Input
                                            value={editForm.description}
                                            className="bg-slate-50 border-slate-100 py-6 rounded-2xl"
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)} className="rounded-xl font-bold">Hủy</Button>
                                        <Button size="sm" onClick={() => handleUpdate(genre.id)} className="bg-indigo-600 rounded-xl font-bold">Cập nhật</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-2xl text-indigo-600 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-500">
                                                <Hash size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{genre.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100 py-0 px-2 rounded-full font-bold">
                                                        {genre.slug}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setIsEditing(genre.id);
                                                    setEditForm({ name: genre.name, description: genre.description || '' });
                                                }}
                                                className="text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(genre.id)}
                                                className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-start gap-3 p-4 bg-slate-50/50 rounded-2xl group-hover:bg-indigo-50/30 transition-colors">
                                            <Info size={14} className="text-slate-400 mt-0.5" />
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                                                {genre.description || 'Chưa cập nhật mô tả chuyên mục.'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 pt-2">
                                            <span className="flex items-center gap-1"><MessageSquare size={12} /> Dữ liệu ID: #{genre.id}</span>
                                            <span className="text-indigo-500/50">Phân loại Active</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                            <LayoutGrid size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">Không tìm thấy kết quả phù hợp</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2">Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo một chuyên mục mới!</p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default AdminGenreManagement;
