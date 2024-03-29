# Generated by Django 4.2.7 on 2023-12-11 04:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('expense', '0001_initial'),
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='splitdetail',
            name='settled_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='expense_settled_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='splitdetail',
            name='split_method',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='expense.splitmethod'),
        ),
        migrations.AddField(
            model_name='splitdetail',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='user_split_detail', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='expense',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='expense_created_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='expense',
            name='group',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='user.expensegroup'),
        ),
        migrations.AddField(
            model_name='expense',
            name='paid_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='expense_paid_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='expense',
            name='split_method',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='expense.splitmethod'),
        ),
    ]
