package com.triplea.gymapp.services;

import android.app.Activity;
import android.util.Log;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.razorpay.Checkout;
import com.razorpay.PaymentResultListener;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class RazorpayService {
    private static final String TAG = "RazorpayService";
    private static final String RAZORPAY_KEY = "rzp_test_GEZQfBnCrf1uyR";
    
    private final Activity activity;
    private final FirebaseFirestore db;
    private final FirebaseAuth auth;
    private PaymentCallback callback;

    public interface PaymentCallback {
        void onPaymentSuccess(String paymentId, String orderId);
        void onPaymentError(int code, String message);
    }

    public RazorpayService(Activity activity) {
        this.activity = activity;
        this.db = FirebaseFirestore.getInstance();
        this.auth = FirebaseAuth.getInstance();
        Checkout.preload(activity.getApplicationContext());
    }

    public void startPayment(String planId, int amount, String planName, PaymentCallback callback) {
        this.callback = callback;
        
        try {
            Checkout checkout = new Checkout();
            checkout.setKeyID(RAZORPAY_KEY);

            JSONObject options = new JSONObject();
            options.put("name", "Triple A Gym");
            options.put("description", planName);
            options.put("currency", "INR");
            options.put("amount", amount * 100); // Razorpay expects amount in paise
            options.put("prefill.email", auth.getCurrentUser().getEmail());
            options.put("theme.color", "#10B981");

            // Create order in Firestore
            String orderId = createOrder(planId, amount);
            options.put("order_id", orderId);

            checkout.open(activity, options);
        } catch (Exception e) {
            Log.e(TAG, "Error starting payment: " + e.getMessage());
            if (callback != null) {
                callback.onPaymentError(-1, "Error starting payment: " + e.getMessage());
            }
        }
    }

    private String createOrder(String planId, int amount) {
        String orderId = db.collection("orders").document().getId();
        
        Map<String, Object> order = new HashMap<>();
        order.put("userId", auth.getCurrentUser().getUid());
        order.put("planId", planId);
        order.put("amount", amount);
        order.put("status", "created");
        order.put("createdAt", System.currentTimeMillis());
        
        db.collection("orders").document(orderId).set(order);
        
        return orderId;
    }

    public void handlePaymentSuccess(String paymentId, String orderId) {
        if (callback != null) {
            callback.onPaymentSuccess(paymentId, orderId);
        }

        // Update order status in Firestore
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "completed");
        updates.put("paymentId", paymentId);
        updates.put("completedAt", System.currentTimeMillis());
        
        db.collection("orders")
            .document(orderId)
            .update(updates)
            .addOnSuccessListener(aVoid -> Log.d(TAG, "Order updated successfully"))
            .addOnFailureListener(e -> Log.e(TAG, "Error updating order", e));
    }

    public void handlePaymentError(int code, String message) {
        if (callback != null) {
            callback.onPaymentError(code, message);
        }
    }
} 