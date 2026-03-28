import React, { useState, useEffect } from "react"
import { premiumPackageService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, Crown, DollarSign, Clock } from "lucide-react"
import { StaffLayout } from "@/components/staff-layout"

const AdminPremiumManagement = () => {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        durationDays: "",
    })

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        try {
            setLoading(true)
            const response = await premiumPackageService.getAll()
            setPackages(response.data || [])
        } catch (error) {
            console.error("Failed to fetch packages:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingPackage) {
                await premiumPackageService.update(editingPackage.id, formData)
            } else {
                await premiumPackageService.create(formData)
            }
            setIsDialogOpen(false)
            fetchPackages()
            resetForm()
        } catch (error) {
            console.error("Failed to save package:", error)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa gói này?")) {
            try {
                await premiumPackageService.delete(id)
                fetchPackages()
            } catch (error) {
                console.error("Failed to delete package:", error)
            }
        }
    }

    const resetForm = () => {
        setFormData({ name: "", description: "", price: "", durationDays: "" })
        setEditingPackage(null)
    }

    const handleEdit = (pkg) => {
        setEditingPackage(pkg)
        setFormData({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            durationDays: pkg.durationDays,
        })
        setIsDialogOpen(true)
    }

    if (loading && packages.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <StaffLayout>
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Gói Premium</h1>
                    <p className="text-muted-foreground font-medium">Tạo và cấu hình các gói ưu đãi thành viên VIP</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">
                            <Plus className="mr-2 h-5 w-5" /> Thêm Gói Mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">{editingPackage ? 'Cập Nhật Gói' : 'Tạo Gói Premium Mới'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tên gói</label>
                                <div className="relative">
                                    <Crown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Ví dụ: Gói VIP Tháng"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Giá (VND)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            placeholder="50000"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="pl-10 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Thời hạn (Ngày)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            value={formData.durationDays}
                                            onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                            className="pl-10 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Mô tả</label>
                                <Textarea
                                    placeholder="Mô tả các quyền lợi của gói..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 min-h-[100px]"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-base">
                                {editingPackage ? 'Cập Nhật Ngay' : 'Tạo Gói Mới ✨'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[30%] py-4 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 pl-8">Thông tin gói</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Giá niêm yết</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Thời hạn</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Mô tả</TableHead>
                            <TableHead className="py-4 text-right pr-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packages.map((pkg) => (
                            <TableRow key={pkg.id} className="border-border hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-bold py-6 pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Crown size={20} />
                                        </div>
                                        <span className="text-slate-900">{pkg.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-black text-indigo-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-600">
                                    {pkg.durationDays} Ngày
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                    {pkg.description || "Không có mô tả"}
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(pkg)}
                                            className="h-9 w-9 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(pkg.id)}
                                            className="h-9 w-9 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {packages.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                            <Crown size={32} />
                                        </div>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chưa có gói Premium nào</p>
                                        <p className="text-muted-foreground text-sm mt-1">Hãy tạo gói đầu tiên để bắt đầu kinh doanh!</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </StaffLayout>
    )
}

export default AdminPremiumManagement
