import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterService, storyService } from '../services/api';
import { Plus, Edit2, Trash2, X, Check, Search, List, LayoutGrid, ArrowLeft, Loader2, Save, FileText, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffLayout } from '@/components/staff-layout';
import { Badge } from '@/components/ui/badge';

const StaffChapterManagement = () => {
    const { storyId } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [form, setForm] = useState({ chapterNumber: '', title: '', content: '' });

    useEffect(() => {
        fetchData();
    }, [storyId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [storyRes, chaptersRes] = await Promise.all([
                storyService.getById(storyId),
                chapterService.getByStory(storyId, 0, 1000)
            ]);
            setStory(storyRes.data);
            setChapters(chaptersRes.data.content);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.chapterNumber || !form.title) return;
        try {
            const payload = {
                ...form,
                chapterNumber: parseInt(form.chapterNumber),
                story: { id: parseInt(storyId) }
            };

            if (isEditing) {
                await chapterService.update(isEditing, payload);
            } else {
                await chapterService.create(payload);
            }

            setIsAdding(false);
            setIsEditing(null);
            setForm({ chapterNumber: '', title: '', content: '' });
            fetchData();
        } catch (error) {
            alert('Lỗi khi lưu chương');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa chương này?')) {
            try {
                await chapterService.delete(id);
                fetchData();
            } catch (error) {
                alert('Lỗi khi xóa chương');
            }
        }
    };

    const startEdit = (chapter) => {
        setIsEditing(chapter.id);
        setIsAdding(true);
        setForm({
            chapterNumber: chapter.chapterNumber.toString(),
            title: chapter.title,
            content: chapter.content || ''
        });
    };

    return (
        <StaffLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/staff/stories')}
                        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Quay lại danh sách truyện
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý chương
                    </h1>
                    <p className="text-indigo-600 font-bold italic">
                        Truyện: {story?.title}
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setIsAdding(true);
                        setIsEditing(null);
                        setForm({ chapterNumber: (chapters.length + 1).toString(), title: '', content: '' });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 font-bold"
                >
                    <Plus className="h-5 w-5" />
                    Thêm chương mới
                </Button>
            </div>

            {isAdding && (
                <div className="mb-12 bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-500/5 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                                {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
                            </div>
                            {isEditing ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full text-slate-300">
                            <X size={24} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Hash size={12} /> Số chương
                            </label>
                            <Input
                                type="number"
                                placeholder="1"
                                className="h-14 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold"
                                value={form.chapterNumber}
                                onChange={(e) => setForm({ ...form, chapterNumber: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FileText size={12} /> Tiêu đề chương
                            </label>
                            <Input
                                placeholder="Ví dụ: Khởi đầu mới..."
                                className="h-14 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung / API Data (JSON Ảnh)</label>
                            <textarea
                                className="w-full min-h-[150px] p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                placeholder="Dán nội dung văn bản hoặc mảng API data của ảnh vào đây..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" className="rounded-xl font-bold px-8 h-12" onClick={() => setIsAdding(false)}>Hủy bỏ</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-100" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Cập nhật chương' : 'Tạo chương ✨'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-40 text-center flex flex-col items-center gap-4 text-slate-300">
                        <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
                        <p className="font-bold">Đang tải danh sách chương...</p>
                    </div>
                ) : chapters.length > 0 ? (
                    chapters.map((chapter) => (
                        <div key={chapter.id} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    {chapter.chapterNumber}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {chapter.title}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">
                                        ID: {chapter.id} • TRẠNG THÁI: ACTIVE
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(chapter)}
                                    className="h-10 w-10 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(chapter.id)}
                                    className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">Chưa có chương nào cho truyện này.</p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffChapterManagement;
