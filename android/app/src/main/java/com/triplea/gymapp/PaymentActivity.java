package com.triplea.gymapp;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.razorpay.PaymentResultListener;
import com.triplea.gymapp.services.RazorpayService;

public class PaymentActivity extends AppCompatActivity implements PaymentResultListener {
    private RazorpayService razorpayService;
    private TextView planNameText;
    private TextView amountText;
    private Button payButton;
    private String planId;
    private int amount;
    private String planName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        // Initialize RazorpayService
        razorpayService = new RazorpayService(this);

        // Get plan details from intent
        planId = getIntent().getStringExtra("planId");
        amount = getIntent().getIntExtra("amount", 0);
        planName = getIntent().getStringExtra("planName");

        // Initialize views
        planNameText = findViewById(R.id.plan_name);
        amountText = findViewById(R.id.amount);
        payButton = findViewById(R.id.pay_button);

        // Set plan details
        planNameText.setText(planName);
        amountText.setText("₹" + amount);

        // Set up pay button
        payButton.setOnClickListener(v -> startPayment());
    }

    private void startPayment() {
        razorpayService.startPayment(planId, amount, planName, new RazorpayService.PaymentCallback() {
            @Override
            public void onPaymentSuccess(String paymentId, String orderId) {
                handlePaymentSuccess(paymentId, orderId);
            }

            @Override
            public void onPaymentError(int code, String message) {
                handlePaymentError(code, message);
            }
        });
    }

    @Override
    public void onPaymentSuccess(String paymentId) {
        handlePaymentSuccess(paymentId, "");
    }

    @Override
    public void onPaymentError(int code, String response) {
        handlePaymentError(code, response);
    }

    private void handlePaymentSuccess(String paymentId, String orderId) {
        Toast.makeText(this, "Payment Successful", Toast.LENGTH_SHORT).show();
        setResult(RESULT_OK);
        finish();
    }

    private void handlePaymentError(int code, String message) {
        Toast.makeText(this, "Payment Failed: " + message, Toast.LENGTH_LONG).show();
        setResult(RESULT_CANCELED);
        finish();
    }
} 