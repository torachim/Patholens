# Generated by Django 5.1.3 on 2025-03-22 21:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0014_alter_doctors_continuediag'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctors',
            name='continueDiag',
            field=models.JSONField(default=dict, null=True),
        ),
    ]
