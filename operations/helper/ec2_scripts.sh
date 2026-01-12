#!/bin/bash

# EC2 Instance Control Script
# Usage: ./ec2-control.sh [start|stop|status] [instance-id]

# Configuration
REGION="ap-southeast-3"
INSTANCE_ID="i-1234567890abcdef0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if AWS CLI is configured
check_aws_config() {
    if ! aws sts get-caller-identity &>/dev/null; then
        print_error "AWS CLI not configured or credentials invalid"
        print_status "Run 'aws configure' to set up your credentials"
        exit 1
    fi
}

# Function to get instance status
get_instance_status() {
    local instance_id=$1
    aws ec2 describe-instances \
        --instance-ids "$instance_id" \
        --region "$REGION" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text 2>/dev/null
}

# Function to start instance
start_instance() {
    local instance_id=$1
    local current_status=$(get_instance_status "$instance_id")
    
    if [ "$current_status" == "None" ] || [ "$current_status" == "" ]; then
        print_error "Instance $instance_id not found or invalid"
        exit 1
    fi
    
    if [ "$current_status" == "running" ]; then
        print_warning "Instance $instance_id is already running"
        return 0
    fi
    
    print_status "Starting instance $instance_id..."
    
    if aws ec2 start-instances --instance-ids "$instance_id" --region "$REGION" &>/dev/null; then
        print_success "Start command sent successfully"
        print_status "Waiting for instance to start..."
        
        # Wait for instance to be running
        aws ec2 wait instance-running --instance-ids "$instance_id" --region "$REGION"
        
        if [ $? -eq 0 ]; then
            print_success "Instance $instance_id is now running"
            
            # Get and display public IP
            public_ip=$(aws ec2 describe-instances \
                --instance-ids "$instance_id" \
                --region "$REGION" \
                --query 'Reservations[0].Instances[0].PublicIpAddress' \
                --output text)
            
            if [ "$public_ip" != "None" ] && [ "$public_ip" != "" ]; then
                print_status "Public IP: $public_ip"
            fi
        else
            print_error "Instance failed to start properly"
        fi
    else
        print_error "Failed to start instance $instance_id"
        exit 1
    fi
}

# Function to stop instance
stop_instance() {
    local instance_id=$1
    local current_status=$(get_instance_status "$instance_id")
    
    if [ "$current_status" == "None" ] || [ "$current_status" == "" ]; then
        print_error "Instance $instance_id not found or invalid"
        exit 1
    fi
    
    if [ "$current_status" == "stopped" ]; then
        print_warning "Instance $instance_id is already stopped"
        return 0
    fi
    
    print_status "Stopping instance $instance_id..."
    
    if aws ec2 stop-instances --instance-ids "$instance_id" --region "$REGION" &>/dev/null; then
        print_success "Stop command sent successfully"
        print_status "Waiting for instance to stop..."
        
        # Wait for instance to be stopped
        aws ec2 wait instance-stopped --instance-ids "$instance_id" --region "$REGION"
        
        if [ $? -eq 0 ]; then
            print_success "Instance $instance_id is now stopped"
        else
            print_error "Instance failed to stop properly"
        fi
    else
        print_error "Failed to stop instance $instance_id"
        exit 1
    fi
}

# Function to show instance status
show_status() {
    local instance_id=$1
    local status=$(get_instance_status "$instance_id")
    
    if [ "$status" == "None" ] || [ "$status" == "" ]; then
        print_error "Instance $instance_id not found or invalid"
        exit 1
    fi
    
    print_status "Instance $instance_id status: $status"
    
    # Get additional details
    instance_info=$(aws ec2 describe-instances \
        --instance-ids "$instance_id" \
        --region "$REGION" \
        --query 'Reservations[0].Instances[0].[InstanceType,PublicIpAddress,PrivateIpAddress,LaunchTime]' \
        --output text)
    
    if [ $? -eq 0 ]; then
        echo "$instance_info" | while read -r instance_type public_ip private_ip launch_time; do
            print_status "Instance Type: $instance_type"
            [ "$public_ip" != "None" ] && print_status "Public IP: $public_ip"
            [ "$private_ip" != "None" ] && print_status "Private IP: $private_ip"
            print_status "Launch Time: $launch_time"
        done
    fi
}

# Function to list all instances
list_instances() {
    print_status "Listing all EC2 instances in region $REGION:"
    aws ec2 describe-instances \
        --region "$REGION" \
        --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType,Tags[?Key==`Name`].Value|[0]]' \
        --output table
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [start|stop|status|list] [instance-id]"
    echo ""
    echo "Commands:"
    echo "  start <instance-id>   - Start the specified EC2 instance"
    echo "  stop <instance-id>    - Stop the specified EC2 instance"
    echo "  status <instance-id>  - Show status of the specified instance"
    echo "  list                  - List all instances in the region"
    echo ""
    echo "Examples:"
    echo "  $0 start i-1234567890abcdef0"
    echo "  $0 stop i-1234567890abcdef0"
    echo "  $0 status i-1234567890abcdef0"
    echo "  $0 list"
    echo ""
    echo "Note: You can set a default INSTANCE_ID in the script configuration"
}

# Main script logic
main() {
    # Check if AWS CLI is configured
    check_aws_config
    
    # Parse command line arguments
    ACTION=$1
    PROVIDED_INSTANCE_ID=$2
    
    # Use provided instance ID or default
    FINAL_INSTANCE_ID=${PROVIDED_INSTANCE_ID:-$INSTANCE_ID}
    
    case "$ACTION" in
        "start")
            if [ -z "$FINAL_INSTANCE_ID" ]; then
                print_error "Instance ID required"
                show_usage
                exit 1
            fi
            start_instance "$FINAL_INSTANCE_ID"
            ;;
        "stop")
            if [ -z "$FINAL_INSTANCE_ID" ]; then
                print_error "Instance ID required"
                show_usage
                exit 1
            fi
            stop_instance "$FINAL_INSTANCE_ID"
            ;;
        "status")
            if [ -z "$FINAL_INSTANCE_ID" ]; then
                print_error "Instance ID required"
                show_usage
                exit 1
            fi
            show_status "$FINAL_INSTANCE_ID"
            ;;
        "list")
            list_instances
            ;;
        *)
            print_error "Invalid action: $ACTION"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"