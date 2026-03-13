from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("synchronizer_app", "0003_room_updated_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="room",
            name="latest_message",
            field=models.CharField(blank=True, default="", max_length=280),
        ),
        migrations.AddField(
            model_name="room",
            name="media_mode",
            field=models.CharField(blank=True, default="video_url", max_length=32),
        ),
        migrations.AddField(
            model_name="room",
            name="state_updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
