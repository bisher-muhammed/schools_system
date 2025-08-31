"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { X, Upload, Image, Check, AlertCircle, School, MapPin, Phone, Mail } from "lucide-react";
import { useRouter } from "next/navigation"; 
import { addSchool } from "@/actions/ScoolList.actions";

export default function AddSchoolPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const watchedImage = watch("image");

  const addAlert = (type, message, duration = 5000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    if (duration > 0) setTimeout(() => removeAlert(id), duration);
  };

  const removeAlert = (id) => setAlerts(prev => prev.filter(alert => alert.id !== id));

  const removeAlertByType = (type) => setAlerts(prev => prev.filter(alert => alert.type !== type));

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    addAlert("info", "Submitting school information...", 0);

    try {
      const file = data.image?.[0];
      if (!file) throw new Error("School image is required");

      // Image validations
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) throw new Error("Invalid image format (JPG, JPEG, PNG)");
      if (file.size > 2 * 1024 * 1024) throw new Error("Image must be smaller than 2MB");

      // Prepare FormData
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("contact", data.contact);
      formData.append("email_id", data.email);
      formData.append("image", file);

      const result = await addSchool(formData);

      removeAlertByType("info");

      if (result.success) {
        addAlert("success", "🎉 School added successfully!");
        reset();
        setTimeout(() => router.push("/"), 2000);
      } else {
        addAlert("error", `Failed to add school: ${result.errors.join(", ")}`);
      }

    } catch (err) {
      removeAlertByType("info");
      addAlert("error", err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => router.push("/");

  const removeImage = () => {
    setValue("image", null);
    addAlert("info", "Image removed", 2000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue("image", e.dataTransfer.files);
      addAlert("success", "Image uploaded successfully!", 3000);
    }
  };

  const AlertMessage = ({ alert }) => {
    const icons = {
      success: <Check className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      info: <AlertCircle className="w-5 h-5" />
    };
    const styles = {
      success: "bg-green-50 border-green-200 text-green-800 shadow-green-100",
      error: "bg-red-50 border-red-200 text-red-800 shadow-red-100",
      info: "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100"
    };
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg ${styles[alert.type]} animate-in slide-in-from-right duration-300`}>
        <div className="flex-shrink-0">{icons[alert.type]}</div>
        <div className="flex-1 text-sm font-medium">{alert.message}</div>
        <button onClick={() => removeAlert(alert.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50 space-y-2 w-96 max-w-full">
        {alerts.map(alert => <AlertMessage key={alert.id} alert={alert} />)}
      </div>

      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button onClick={handleClose} disabled={isSubmitting} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <School className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Add New School</h2>
              <p className="text-blue-100 text-sm">Fill in the details to add a school to the directory</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* School Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-black"><School className="w-4 h-4" /> School Name *</label>
              <input {...register("name", { required: "School name is required", pattern: { value: /^[a-zA-Z0-9\s]+$/, message: "Please use only letters, numbers, and spaces" } })} placeholder="Enter school name" className={`w-full p-4 rounded-xl border-2 text-black placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400 hover:border-gray-300"}`} disabled={isSubmitting} />
              {errors.name && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.name.message}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><MapPin className="w-4 h-4" /> Complete Address *</label>
              <textarea {...register("address", { required: "Address is required" })} placeholder="Enter complete address" rows={3} className={`w-full p-4 rounded-xl border-2 text-black placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none ${errors.address ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400 hover:border-gray-300"}`} disabled={isSubmitting} />
              {errors.address && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.address.message}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">City *</label>
                <input {...register("city", { required: "City is required", pattern: { value: /^[a-zA-Z\s]+$/, message: "Please use only letters and spaces" } })} placeholder="Enter city" className={`w-full p-4 rounded-xl border-2 text-black placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.city ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400 hover:border-gray-300"}`} disabled={isSubmitting} />
                {errors.city && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">State *</label>
                <input {...register("state", { required: "State is required" })} placeholder="Enter state" className={`w-full p-4 rounded-xl border-2 text-black placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.state ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400 hover:border-gray-300"}`} disabled={isSubmitting} />
                {errors.state && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.state.message}</p>}
              </div>
            </div>

            {/* Contact & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Phone className="w-4 h-4" /> Contact Number *</label>
                <input {...register("contact", { required: "Contact number is required", pattern: { value: /^[0-9]{10}$/, message: "Please enter a valid 10-digit number" } })} placeholder="Enter 10-digit number" className={`w-full p-4 rounded-xl border-2 text-black placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.contact ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400 hover:border-gray-300"}`} disabled={isSubmitting} />
                {errors.contact && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.contact.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Mail className="w-4 h-4" /> Email Address *</label>
                <input type="email" {...register("email", { required: "Email address is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" } })} placeholder="Enter email" className={`w-full p-4 rounded-xl border-2 text-black placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-blue-400 hover:border-gray-300"}`} disabled={isSubmitting} />
                {errors.email && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.email.message}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Image className="w-4 h-4" /> School Image *</label>
              {!watchedImage?.[0] ? (
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive ? 'border-blue-400 bg-blue-50' : errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Upload School Image</h4>
                  <p className="text-gray-500 mb-4">Drag and drop your image here, or click to browse</p>
                  <input type="file" accept="image/png, image/jpeg, image/jpg" {...register("image", { required: "School image is required" })} className="hidden" id="imageUpload" disabled={isSubmitting} />
                  <label htmlFor="imageUpload" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">Choose File</label>
                  <p className="text-xs text-gray-400 mt-2">JPG, JPEG, PNG • Max 2MB</p>
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-xl p-4 flex items-start gap-4">
                  <img src={URL.createObjectURL(watchedImage[0])} alt="Preview" className="w-32 h-32 object-cover rounded-lg border shadow-sm" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{watchedImage[0].name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{(watchedImage[0].size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={removeImage} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium" disabled={isSubmitting}>Remove Image</button>
                  </div>
                </div>
              )}
              {errors.image && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errors.image.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button type="submit" disabled={isSubmitting} className="order-1 sm:order-2 sm:ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 min-w-[140px]">
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <School className="w-5 h-5" /> Add School
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

