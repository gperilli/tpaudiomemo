class RegistrationsController < Devise::RegistrationsController

    def update_resource(resource, account_update_params)
  
      # update email
      if account_update_params[:email].present?
        if resource.valid_password?(account_update_params[:current_password])
          if resource.update_with_password(account_update_params)
            return { message: "email updated successfully" }
          else
            return { error: resource.errors.full_messages }
          end
        else
          return { error: "Invalid password" }
        end
      
      # update password
      elsif account_update_params[:password].present? || account_update_params[:password_confirmation].present?
        if account_update_params[:current_password].nil? || account_update_params[:password].nil? || account_update_params[:password_confirmation].nil?
          return { error: "password update missing value failure" }
        elsif account_update_params[:current_password].present? && account_update_params[:password].present? && account_update_params[:password_confirmation].present?
          if account_update_params[:password] != account_update_params[:password_confirmation]
            return { error: "password confirm match failure" }
          else
            if resource.valid_password?(account_update_params[:current_password])
              if resource.update_with_password(account_update_params)
                sign_in(resource, bypass: true)
                return { message: "Password updated successfully" }
              else
                return { error: resource.errors.full_messages }
              end
            else
              return { error: "Invalid current password" }
            end
          end
        end
      
      elsif account_update_params[:email].nil? && account_update_params[:current_password].nil? && account_update_params[:password].nil? && account_update_params[:password_confirmation].nil?
        if resource.update_without_password(account_update_params)
          return { message: "profile details updated successfully" }
        else
          return { error: resource.errors.full_messages }
        end      
      end
  
    end
  
    def update
      resource = current_user
      result = update_resource(resource, account_update_params)
      
      respond_to do |format|
        format.json { render json: result, status: result[:error].present? ? :unprocessable_entity : :ok }
      end
    end
      
    protected
  
    def account_update_params
      params.require(:user).permit(
        :name, :email, :current_password, :password, :password_confirmation
      )
    end
  end
  
  